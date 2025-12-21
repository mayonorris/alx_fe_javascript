// ===== Task 2: Dynamic Filtering + persistence (builds on Task 1) =====

// ---- Storage keys
const LS_QUOTES_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastQuote";
const LS_FILTER_KEY = "quotesFilter";

// ---- Defaults
const DEFAULT_QUOTES = [
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Programs must be written for people to read.", category: "software" },
  { text: "First, solve the problem. Then, write the code.", category: "software" },
  { text: "The only way to learn a new programming language is by writing programs in it.", category: "learning" },
  { text: "Performance is a feature.", category: "engineering" },
];

// ---- App state
let quotes = [];

/* ===========================
   Render helpers
=========================== */
function getCurrentFilter() {
  const sel = document.getElementById("categoryFilter");
  return sel ? sel.value : "all";
}

function getFilteredQuotes() {
  const f = getCurrentFilter();
  if (f === "all") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === f.toLowerCase());
}

function renderQuote(q) {
  const box = document.getElementById("quoteDisplay");
  if (!q) {
    box.innerHTML = '<p class="muted">No quotes available. Add one below!</p>';
    sessionStorage.removeItem(SS_LAST_QUOTE_KEY);
    return;
  }
  box.innerHTML = `
    <div class="quote-text">“${q.text}”</div>
    <div class="quote-meta">Category: <strong>${q.category}</strong></div>
  `;
  // remember last viewed in this session
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
  } catch (_) {}
}

function renderQuoteList(list) {
  const box = document.getElementById("quoteDisplay");
  if (!list || list.length === 0) {
    box.innerHTML = '<p class="muted">No quotes for this category yet.</p>';
    return;
  }
  // show a simple list for the filter view
  const items = list.map(q => `<li>“${q.text}” <span class="quote-meta">(${q.category})</span></li>`).join("");
  box.innerHTML = `<ul>${items}</ul>`;
}

/* ===========================
   Random show respects filter
=========================== */
function showRandomQuote() {
  const pool = getFilteredQuotes();
  if (pool.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() => Math.random() * pool.length);
  renderQuote(pool[idx]);
}

/* ===========================
   Add Quote UI + logic
=========================== */
function createAddQuoteForm() {
  const mount = document.getElementById("formMount");

  const wrapper = document.createElement("div");
  wrapper.className = "row";
  wrapper.id = "addQuoteWrapper";

  const inputText = document.createElement("input");
  inputText.type = "text";
  inputText.id = "newQuoteText";
  inputText.placeholder = "Enter a new quote";

  const inputCat = document.createElement("input");
  inputCat.type = "text";
  inputCat.id = "newQuoteCategory";
  inputCat.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "Add Quote";
  addBtn.addEventListener("click", addQuote);

  wrapper.append(inputText, inputCat, addBtn);
  mount.appendChild(wrapper);
}

function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text) { alert("Please enter a quote."); textEl.focus(); return; }
  if (!category) { alert("Please enter a category."); catEl.focus(); return; }

  quotes.push({ text, category });
  saveQuotes();

  // Update categories in dropdown if needed
  populateCategories();

  // Clear inputs
  textEl.value = "";
  catEl.value = "";

  // Re-render current filter view
  filterQuotes();
}

/* ===========================
   Local & Session Storage
=========================== */
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (quotes.length === 0) { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
    } else {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes();
    }
  } catch (_) {
    quotes = [...DEFAULT_QUOTES];
    saveQuotes();
  }
}

function saveQuotes() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
  } catch (_) {}
}

/* ===========================
   JSON Import / Export (Task 1)
=========================== */
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "quotes.json";
  document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
}

function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) { alert("Invalid file format."); return; }
      const valid = imported.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (valid.length === 0) { alert("No valid quotes found in file."); return; }
      quotes.push(...valid);
      saveQuotes();
      populateCategories();   // categories might have changed
      filterQuotes();         // refresh current view
      alert("Quotes imported successfully!");
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

/* ===========================
   Task 2: Categories & Filtering
=========================== */
function uniqueCategories() {
  const set = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;

  const current = sel.value || "all";
  // clear (keep first 'all' option)
  sel.innerHTML = `<option value="all">All Categories</option>`;

  const cats = uniqueCategories();
  cats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });

  // restore last selected (from localStorage if available), else keep current
  const saved = localStorage.getItem(LS_FILTER_KEY);
  const toUse = saved || current;
  if ([...sel.options].some(o => o.value === toUse)) {
    sel.value = toUse;
  } else {
    sel.value = "all";
  }
}

function filterQuotes() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;

  const chosen = sel.value || "all";
  // remember filter selection
  try { localStorage.setItem(LS_FILTER_KEY, chosen); } catch (_) {}

  const list = getFilteredQuotes();
  // Render a list view for the current filter
  // (You still have the random button to show a single random from this set)
  renderQuoteList(list);
}

/* ===========================
   Boot
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();

  // build categories first, restore saved selection
  populateCategories();

  // initial render: use saved filter to show a list
  filterQuotes();

  // wire up controls
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);

  // add-quote UI
  createAddQuoteForm();
});

// expose import for inline handler
window.importFromJsonFile = importFromJsonFile;

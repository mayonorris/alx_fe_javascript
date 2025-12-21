// ===== Task 1: Web Storage + JSON Import/Export =====

// ---- Storage keys
const LS_QUOTES_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastQuote";

// ---- Default quotes (used if localStorage is empty)
const DEFAULT_QUOTES = [
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Programs must be written for people to read.", category: "software" },
  { text: "First, solve the problem. Then, write the code.", category: "software" },
  { text: "The only way to learn a new programming language is by writing programs in it.", category: "learning" },
  { text: "Performance is a feature.", category: "engineering" },
];

// ---- App state (in-memory)
let quotes = [];

/* ===========================
   Render & Random utilities
=========================== */
function renderQuote(q) {
  const box = document.getElementById("quoteDisplay");
  if (!q) {
    box.innerHTML = '<p class="muted">No quotes available. Add one below!</p>';
    // clear last viewed in session if nothing to show
    sessionStorage.removeItem(SS_LAST_QUOTE_KEY);
    return;
  }
  box.innerHTML = `
    <div class="quote-text">“${q.text}”</div>
    <div class="quote-meta">Category: <strong>${q.category}</strong></div>
  `;
  // OPTIONAL (Task requires sessionStorage demo): remember last viewed quote
  try {
    sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q));
  } catch (_) { /* ignore */ }
}

function showRandomQuote() {
  if (quotes.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  renderQuote(quotes[idx]);
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
  saveQuotes();                 // persist after any change

  // Clear inputs and show the newly added quote
  textEl.value = "";
  catEl.value = "";
  renderQuote({ text, category });
}

/* ===========================
   Local & Session Storage
=========================== */
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotes(); // initialize storage with defaults
      return;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // basic shape validation (must be objects with text & category)
      quotes = parsed.filter(
        q => q && typeof q.text === "string" && typeof q.category === "string"
      );
      // if validation nuked everything, fall back to defaults
      if (quotes.length === 0) {
        quotes = [...DEFAULT_QUOTES];
        saveQuotes();
      }
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
  } catch (_) {
    // storage might be full or blocked; ignore for this task
  }
}

/* ===========================
   JSON Import / Export
=========================== */
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2); // pretty-print
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();

  // cleanup
  URL.revokeObjectURL(url);
  a.remove();
}

// Per spec: this is called inline via onchange on the <input type="file">
function importFromJsonFile(event) {
  const file = event?.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);

      if (!Array.isArray(imported)) {
        alert("Invalid file format: expected an array of quotes.");
        return;
      }

      // validate shape: { text: string, category: string }
      const valid = imported.filter(
        q => q && typeof q.text === "string" && typeof q.category === "string"
      );

      if (valid.length === 0) {
        alert("No valid quotes found in file.");
        return;
      }

      // merge (simple approach; duplicates allowed for now)
      quotes.push(...valid);
      saveQuotes();
      alert("Quotes imported successfully!");

      // show a random quote from the merged set
      showRandomQuote();
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  reader.readAsText(file);
}

/* ===========================
   Boot
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  // Load from localStorage (or defaults)
  loadQuotes();

  // If session has a last viewed quote, show it; otherwise random
  try {
    const last = sessionStorage.getItem(SS_LAST_QUOTE_KEY);
    if (last) {
      const q = JSON.parse(last);
      if (q && typeof q.text === "string" && typeof q.category === "string") {
        renderQuote(q);
      } else {
        showRandomQuote();
      }
    } else {
      showRandomQuote();
    }
  } catch (_) {
    showRandomQuote();
  }

  // Wire up UI
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
  createAddQuoteForm();
});

// Expose import function globally for inline onchange handler
window.importFromJsonFile = importFromJsonFile;

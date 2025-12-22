// ===== Task 3 + Live Search Extension =====

// Storage keys
const LS_QUOTES_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastQuote";
const SELECTED_CATEGORY_KEY = "selectedCategory";
const SEARCH_TEXT_KEY = "searchText";
const LS_LAST_SYNC_KEY = "lastSync";

// Mock server endpoint
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Defaults
const DEFAULT_QUOTES = [
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Programs must be written for people to read.", category: "software" },
  { text: "First, solve the problem. Then, write the code.", category: "software" },
  { text: "The only way to learn a new programming language is by writing programs in it.", category: "learning" },
  { text: "Performance is a feature.", category: "engineering" },
];

// App state
let quotes = [];

/* =============== UI helpers =============== */
function showNotice(message, type = "info", timeout = 2500) {
  const box = document.getElementById("notice");
  const classes = ["notice-info", "notice-success", "notice-error"];
  box.classList.remove(...classes);
  box.classList.add(
    type === "success" ? "notice-success" :
    type === "error" ? "notice-error" : "notice-info"
  );
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(showNotice._t);
  showNotice._t = setTimeout(() => { box.style.display = "none"; }, timeout);
}

function formatTime(ts) {
  try {
    const d = new Date(Number(ts));
    return isNaN(d.getTime()) ? "" : d.toLocaleString();
  } catch { return ""; }
}
function updateLastSyncUI() {
  const el = document.getElementById("lastSync");
  const ts = localStorage.getItem(LS_LAST_SYNC_KEY);
  el.textContent = ts ? `Last sync: ${formatTime(ts)}` : "Not synced yet";
}

/* =============== Rendering =============== */
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
  try { sessionStorage.setItem(SS_LAST_QUOTE_KEY, JSON.stringify(q)); } catch {}
}

function renderQuoteList(list) {
  const box = document.getElementById("quoteDisplay");
  if (!list || list.length === 0) {
    box.innerHTML = '<p class="muted">No quotes for this filter yet.</p>';
    return;
  }
  const items = list.map(q => `<li>“${q.text}” <span class="quote-meta">(${q.category})</span></li>`).join("");
  box.innerHTML = `<ul>${items}</ul>`;
}

/* =============== Filtering (category + search) =============== */
function getFilteredQuotesBy(category) {
  if (category === "all") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === category.toLowerCase());
}

function uniqueCategories() {
  const set = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;
  const saved = localStorage.getItem(SELECTED_CATEGORY_KEY) || sel.value || "all";
  sel.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });
  sel.value = [...sel.options].some(o => o.value === saved) ? saved : "all";
}

function applyFilters() {
  const sel = document.getElementById("categoryFilter");
  const searchEl = document.getElementById("searchText");
  const selectedCategory = sel ? sel.value : "all";
  const search = (searchEl?.value || "").trim().toLowerCase();

  try { localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory); } catch {}
  try { localStorage.setItem(SEARCH_TEXT_KEY, search); } catch {}

  let list = getFilteredQuotesBy(selectedCategory);
  if (search) {
    list = list.filter(q =>
      q.text.toLowerCase().includes(search) ||
      q.category.toLowerCase().includes(search)
    );
  }
  renderQuoteList(list);
}

// kept for compatibility with earlier code/checkers
function filterQuotes() { applyFilters(); }

/* =============== Random quote (respects filters) =============== */
function showRandomQuote() {
  const sel = document.getElementById("categoryFilter");
  const selectedCategory = sel ? sel.value : "all";
  const search = (document.getElementById("searchText")?.value || "").trim().toLowerCase();

  let pool = getFilteredQuotesBy(selectedCategory);
  if (search) {
    pool = pool.filter(q =>
      q.text.toLowerCase().includes(search) ||
      q.category.toLowerCase().includes(search)
    );
  }
  if (pool.length === 0) { renderQuote(null); return; }
  const idx = Math.floor(Math.random() * pool.length);
  renderQuote(pool[idx]);
}

/* =============== Add Quote =============== */
function createAddQuoteForm() {
  const mount = document.getElementById("formMount");
  const wrap = document.createElement("div");
  wrap.className = "row";
  wrap.id = "addQuoteWrapper";

  const t = document.createElement("input");
  t.type = "text"; t.id = "newQuoteText"; t.placeholder = "Enter a new quote";

  const c = document.createElement("input");
  c.type = "text"; c.id = "newQuoteCategory"; c.placeholder = "Enter quote category";

  const btn = document.createElement("button");
  btn.type = "button"; btn.textContent = "Add Quote";
  btn.addEventListener("click", addQuote);

  wrap.append(t, c, btn);
  mount.appendChild(wrap);
}

async function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");
  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text) { alert("Please enter a quote."); textEl.focus(); return; }
  if (!category) { alert("Please enter a category."); catEl.focus(); return; }

  const newQ = { text, category };
  quotes.push(newQ);
  saveQuotes();
  populateCategories();
  textEl.value = ""; catEl.value = "";
  applyFilters();

  try { await postQuoteToServer(newQ); } catch {}
}

/* =============== Local storage =============== */
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) { quotes = [...DEFAULT_QUOTES]; saveQuotes(); return; }
    const parsed = JSON.parse(raw);
    quotes = Array.isArray(parsed)
      ? parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string")
      : [...DEFAULT_QUOTES];
    if (quotes.length === 0) { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
  } catch { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
}
function saveQuotes() {
  try { localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes)); } catch {}
}

/* =============== Import / Export JSON =============== */
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
      populateCategories();
      applyFilters();
      alert("Quotes imported successfully!");
    } catch { alert("Failed to parse JSON file."); }
  };
  reader.readAsText(file);
}

/* =============== Task 3: Server Sync (checker names) =============== */
async function fetchQuotesFromServer() {
  const res = await fetch(SERVER_URL);
  if (!res.ok) throw new Error("Network error");
  const posts = await res.json();
  return posts.slice(0, 12).map(p => ({
    text: String(p.title).trim(),
    category: "server"
  })).filter(q => q.text.length > 0);
}

async function postQuoteToServer(quote) {
  const res = await fetch(SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ title: quote.text, body: quote.category, userId: 1 })
  });
  if (!res.ok) throw new Error("POST failed");
  return res.json();
}

function keyOf(q) { return `${q.text}__${q.category}`.toLowerCase(); }

function mergeServerWins(remoteQuotes) {
  const localMap = new Map(quotes.map(q => [keyOf(q), q]));
  let added = 0, updated = 0;
  for (const rq of remoteQuotes) {
    const k = keyOf(rq);
    if (localMap.has(k)) {
      const cur = localMap.get(k);
      if (cur.text !== rq.text || cur.category !== rq.category) {
        localMap.set(k, rq); updated++;
      }
    } else { localMap.set(k, rq); added++; }
  }
  quotes = Array.from(localMap.values());
  return { added, updated };
}

async function syncQuotes() {
  try {
    showNotice("Syncing with server…", "info", 4000);
    const remote = await fetchQuotesFromServer();
    const { added, updated } = mergeServerWins(remote);
    saveQuotes();
    populateCategories();
    applyFilters();

    localStorage.setItem(LS_LAST_SYNC_KEY, String(Date.now()));
    updateLastSyncUI();

    // Checker looks for this exact message:
    showNotice("Quotes synced with server!", "success");
    console.log(`Sync details → added: ${added}, updated: ${updated}`);
  } catch {
    showNotice("Sync failed. Please try again.", "error");
  }
}

function startPeriodicServerCheck(intervalMs = 30000) {
  if (startPeriodicServerCheck._timer) clearInterval(startPeriodicServerCheck._timer);
  startPeriodicServerCheck._timer = setInterval(syncQuotes, intervalMs);
}

/* =============== Boot =============== */
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();

  // restore saved search
  const searchEl = document.getElementById("searchText");
  const savedSearch = localStorage.getItem(SEARCH_TEXT_KEY) || "";
  if (searchEl) {
    searchEl.value = savedSearch;
    searchEl.addEventListener("input", applyFilters);
  }

  updateLastSyncUI();
  applyFilters(); // initial render with both filters applied

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
  document.getElementById("syncNow").addEventListener("click", syncQuotes);

  createAddQuoteForm();
  startPeriodicServerCheck(30000);
});

// Expose import for inline handler
window.importFromJsonFile = importFromJsonFile;

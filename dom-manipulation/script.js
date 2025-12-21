// ===== Task 3: Server Sync + Conflict Resolution =====

// Storage keys
const LS_QUOTES_KEY = "quotes";
const SS_LAST_QUOTE_KEY = "lastQuote";
const SELECTED_CATEGORY_KEY = "selectedCategory";
const LS_LAST_SYNC_KEY = "lastSync";

// Mock "server" endpoint (JSONPlaceholder)
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

/* ===========================
   Utilities: notices & time
=========================== */
function showNotice(message, type = "info", timeout = 2500) {
  const box = document.getElementById("notice");
  const classes = ["notice-info","notice-success","notice-error"];
  box.classList.remove(...classes);
  box.classList.add(type === "success" ? "notice-success"
                    : type === "error" ? "notice-error"
                    : "notice-info");
  box.textContent = message;
  box.style.display = "block";
  clearTimeout(showNotice._t);
  showNotice._t = setTimeout(() => { box.style.display = "none"; }, timeout);
}

function formatTime(ts) {
  try {
    const d = new Date(Number(ts));
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString();
  } catch { return ""; }
}

function updateLastSyncUI() {
  const el = document.getElementById("lastSync");
  const ts = localStorage.getItem(LS_LAST_SYNC_KEY);
  el.textContent = ts ? `Last sync: ${formatTime(ts)}` : "Not synced yet";
}

/* ===========================
   Rendering
=========================== */
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
    box.innerHTML = '<p class="muted">No quotes for this category yet.</p>';
    return;
  }
  const items = list.map(q => `<li>“${q.text}” <span class="quote-meta">(${q.category})</span></li>`).join("");
  box.innerHTML = `<ul>${items}</ul>`;
}

/* ===========================
   Filtering
=========================== */
function getFilteredQuotesBy(selectedCategory) {
  if (selectedCategory === "all") return quotes;
  return quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());
}

function uniqueCategories() {
  const set = new Set(quotes.map(q => q.category.trim()).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;

  const savedSelectedCategory = localStorage.getItem(SELECTED_CATEGORY_KEY) || sel.value || "all";
  sel.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories().forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    sel.appendChild(opt);
  });

  if ([...sel.options].some(o => o.value === savedSelectedCategory)) {
    sel.value = savedSelectedCategory;
  } else {
    sel.value = "all";
  }
}

function filterQuotes() {
  const sel = document.getElementById("categoryFilter");
  if (!sel) return;
  const selectedCategory = sel.value || "all";
  try { localStorage.setItem(SELECTED_CATEGORY_KEY, selectedCategory); } catch {}
  renderQuoteList(getFilteredQuotesBy(selectedCategory));
}

/* ===========================
   Random
=========================== */
function showRandomQuote() {
  const selEl = document.getElementById("categoryFilter");
  const selectedCategory = selEl ? selEl.value : "all";
  const pool = getFilteredQuotesBy(selectedCategory);
  if (pool.length === 0) { renderQuote(null); return; }
  const idx = Math.floor(Math.random() * pool.length);
  renderQuote(pool[idx]);
}

/* ===========================
   Add Quote
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
  populateCategories();
  textEl.value = "";
  catEl.value = "";
  filterQuotes();
}

/* ===========================
   Local Storage
=========================== */
function loadQuotes() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) { quotes = [...DEFAULT_QUOTES]; saveQuotes(); return; }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      if (quotes.length === 0) { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
    } else { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
  } catch { quotes = [...DEFAULT_QUOTES]; saveQuotes(); }
}

function saveQuotes() {
  try { localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes)); } catch {}
}

/* ===========================
   Import / Export (JSON)
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
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch { alert("Failed to parse JSON file."); }
  };
  reader.readAsText(file);
}

/* ===========================
   Task 3: Server Sync
=========================== */
// Map remote posts -> quotes
async function fetchRemoteQuotes() {
  const res = await fetch(SERVER_URL);
  if (!res.ok) throw new Error("Network error");
  const posts = await res.json();
  // Limit to keep UI tidy; map to our shape
  return posts.slice(0, 12).map(p => ({
    text: String(p.title).trim(),
    category: "server"            // all server quotes share a category
  })).filter(q => q.text.length > 0);
}

// Key builder for dedupe/conflict resolution
function keyOf(q) {
  return `${q.text}__${q.category}`.toLowerCase();
}

/**
 * Merge remote quotes into local with a simple strategy:
 * - If remote and local share the same key (text+category), remote **wins** (replace).
 * - If remote key doesn't exist locally, add it.
 * Returns stats for UI.
 */
function mergeServerWins(remoteQuotes) {
  const localMap = new Map(quotes.map(q => [keyOf(q), q]));
  let added = 0, updated = 0;

  for (const rq of remoteQuotes) {
    const k = keyOf(rq);
    if (localMap.has(k)) {
      const current = localMap.get(k);
      // Replace only if something differs (future-proof)
      if (current.text !== rq.text || current.category !== rq.category) {
        localMap.set(k, rq);
        updated++;
      }
    } else {
      localMap.set(k, rq);
      added++;
    }
  }

  // Write back to quotes array
  quotes = Array.from(localMap.values());
  return { added, updated };
}

async function syncWithServer() {
  try {
    showNotice("Syncing with server…", "info", 4000);
    const remote = await fetchRemoteQuotes();
    const { added, updated } = mergeServerWins(remote);
    saveQuotes();
    populateCategories();
    filterQuotes();

    localStorage.setItem(LS_LAST_SYNC_KEY, String(Date.now()));
    updateLastSyncUI();

    const msg = (added === 0 && updated === 0)
      ? "Already up to date."
      : `Sync complete: ${added} added, ${updated} updated (server-wins).`;
    showNotice(msg, "success");
  } catch (err) {
    showNotice("Sync failed. Please try again.", "error");
  }
}

function startAutoSync(intervalMs = 30000) {
  // Avoid multiple timers if hot-reloading
  if (startAutoSync._timer) clearInterval(startAutoSync._timer);
  startAutoSync._timer = setInterval(syncWithServer, intervalMs);
}

/* ===========================
   Boot
=========================== */
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  updateLastSyncUI();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("exportJson").addEventListener("click", exportToJsonFile);
  document.getElementById("syncNow").addEventListener("click", syncWithServer);

  createAddQuoteForm();

  // Kick off periodic sync (every 30s)
  startAutoSync(30000);
});

// Expose import for inline handler
window.importFromJsonFile = importFromJsonFile;

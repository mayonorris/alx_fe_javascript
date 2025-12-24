// Link-in-Bio with Click Counters + Dark/Light + JSON import/export
const LS_KEY = "linkinbio_links";
const THEME_KEY = "linkinbio_theme";

const DEFAULT_LINKS = [
  { label: "Portfolio", url: "https://your-portfolio.example", clicks: 0 },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/your-profile", clicks: 0 },
  { label: "GitHub", url: "https://github.com/your-username", clicks: 0 },
  { label: "ALX", url: "https://www.alxafrica.com/", clicks: 0 },
];

let links = [];

const $ = (id) => document.getElementById(id);
const statusEl = $("status");
const listEl = $("linksList");

function setStatus(msg){ statusEl.textContent = msg; }

function loadLinks(){
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { links = [...DEFAULT_LINKS]; saveLinks(); return; }
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) links = arr;
    if (links.length === 0) links = [...DEFAULT_LINKS];
  } catch { links = [...DEFAULT_LINKS]; }
}

function saveLinks(){
  try { localStorage.setItem(LS_KEY, JSON.stringify(links)); } catch {}
}

function render(){
  listEl.innerHTML = "";
  if (links.length === 0) {
    listEl.innerHTML = `<div class="link"><span class="muted">No links yet. Add one below.</span></div>`;
    return;
  }
  links.forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "link";

    const left = document.createElement("div");
    const a = document.createElement("a");
    a.href = item.url;
    a.target = "_blank"; a.rel = "noopener";
    a.textContent = item.label;
    a.addEventListener("click", () => increment(idx));
    left.appendChild(a);

    const right = document.createElement("div");
    right.className = "meta";

    const cnt = document.createElement("span");
    cnt.className = "count";
    cnt.textContent = `${item.clicks} clicks`;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy";
    copyBtn.type = "button";
    copyBtn.textContent = "Copy URL";
    copyBtn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(item.url); setStatus("Copied URL to clipboard"); }
      catch { setStatus("Copy failed"); }
    });

    right.append(cnt, copyBtn);
    row.append(left, right);
    listEl.appendChild(row);
  });
}

function increment(index){
  links[index].clicks = (links[index].clicks || 0) + 1;
  saveLinks(); render();
}

function addLink(label, url){
  links.push({ label, url, clicks: 0 });
  saveLinks(); render(); setStatus("Link added");
}

function exportJSON(){
  const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "links.json";
  document.body.appendChild(a); a.click();
  URL.revokeObjectURL(url); a.remove();
  setStatus("Exported JSON");
}

function importJSON(file){
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const arr = JSON.parse(e.target.result);
      if (!Array.isArray(arr)) { setStatus("Invalid JSON"); return; }
      // Merge by URL (preserve clicks if same URL already exists)
      const byUrl = new Map(links.map(l => [l.url, l]));
      arr.forEach(rec => {
        if (rec && rec.url && rec.label) {
          if (byUrl.has(rec.url)) {
            const cur = byUrl.get(rec.url);
            cur.label = rec.label;
            cur.clicks = Math.max(cur.clicks || 0, rec.clicks || 0);
          } else {
            byUrl.set(rec.url, { label: rec.label, url: rec.url, clicks: rec.clicks || 0 });
          }
        }
      });
      links = Array.from(byUrl.values());
      saveLinks(); render(); setStatus("Imported JSON");
    } catch { setStatus("Invalid JSON"); }
  };
  reader.readAsText(file);
}

/* Theme */
function applyTheme(mode){
  const body = document.body;
  if (mode === "light") {
    body.classList.add("light");
    $("themeBtn").textContent = "🌙 Dark";
    $("themeBtn").setAttribute("aria-pressed", "false");
  } else {
    body.classList.remove("light");
    $("themeBtn").textContent = "☀️ Light";
    $("themeBtn").setAttribute("aria-pressed", "true");
  }
}
function toggleTheme(){
  const cur = localStorage.getItem(THEME_KEY) || "dark";
  const next = cur === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  // theme
  const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
  applyTheme(savedTheme);
  $("themeBtn").addEventListener("click", toggleTheme);

  // data
  loadLinks(); render();

  // add form
  $("addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const label = $("labelInput").value.trim();
    const url = $("urlInput").value.trim();
    if (!label || !url) return;
    addLink(label, url);
    $("labelInput").value = ""; $("urlInput").value = "";
  });

  // export / import
  $("exportBtn").addEventListener("click", exportJSON);
  $("importFile").addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (file) importJSON(file);
    e.target.value = ""; // clear
  });

  setStatus("Ready");
});

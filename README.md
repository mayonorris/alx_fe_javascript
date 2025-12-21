# DOM Manipulation, Web Storage & JSON Data

Build a dynamic **Quote Generator** that showcases advanced **DOM manipulation**, **Web Storage** (localStorage / sessionStorage), and **JSON import/export**. You’ll progressively add features across four tasks, ending with a filterable, persistent app that can sync with a mock server.

---

## 🎯 Learning Objectives

- Create and manipulate dynamic content with vanilla JavaScript.
- Persist data using **localStorage** and **sessionStorage**.
- Import/export data with **JSON** (Blob, FileReader).
- Implement a **category filter** with stored user preferences.
- (Bonus) Simulate **server sync** and handle conflicts.

---

## 📂 Repository Layout

```text
alx_fe_javascript/
└─ dom-manipulation/
├─ index.html
├─ script.js
├─ styles.css # optional, not required by tasks
├─ quotes.json # optional sample data for import
└─ README.md
```


> Each task builds on the previous one.

--

## 🚀 How to Run

1. Clone the repo or open the folder in your editor.
2. Open `index.html` in your browser (no build tools required).
3. Open DevTools console for debugging.

> Tip: Use a small static server if you test file uploads:  
> `python3 -m http.server`

---

## ✅ Tasks Overview

### Task 0 — Dynamic Content Generator (Mandatory)
**Goal:** A working “Dynamic Quote Generator” that:
- Displays a **random quote** (text + category).
- Lets users **add quotes** via a form created dynamically.

**Key Functions**
- `showRandomQuote()` — renders a random quote.
- `createAddQuoteForm()` — injects the “add quote” UI.
- `addQuote()` — validates inputs, updates the in-memory array, re-renders.

**HTML**
- Minimal skeleton with: `#quoteDisplay`, `#newQuote` button, a mount point for the form.

---

### Task 1 — Web Storage & JSON Handling (Mandatory)
**Goal:** Persist quotes and enable data portability.

**What to implement**
- **localStorage**: load quotes on startup; save on every add/remove.
- **sessionStorage** (optional): store “last viewed quote” or UI state.
- **Export** to JSON: create a Blob, a temporary download link.
- **Import** from JSON: `<input type="file" accept=".json">` + `FileReader` → merge + save.

**Key helpers**
- `saveQuotes()` / `loadQuotes()`
- `exportToJsonFile()` (Blob + `URL.createObjectURL`)
- `importFromJsonFile(event)` (reads JSON, validates, merges, saves)

---

### Task 2 — Dynamic Filtering with Web Storage (Mandatory)
**Goal:** Filter quotes by **category**, and remember the user’s last filter.

**What to implement**
- A `<select id="categoryFilter">` populated dynamically from unique categories.
- `populateCategories()` — fills dropdown, includes **All Categories**.
- `filterQuotes()` — renders quotes matching the selected category.
- Persist the last selected category in **localStorage** and restore on load.
- Update categories live when new quotes introduce new categories.

---

### Task 3 — Sync with Server + Conflict Resolution (Mandatory)
**Goal:** Simulate syncing local quotes with a server (e.g., JSONPlaceholder).

**What to implement**
- Poll or on-demand **fetch** to get remote quotes.
- **Merge** strategy (simple approach: **server-wins** on conflicts).
- Notify the user when updates/conflicts happen (banner/toast).
- Keep localStorage consistent after every sync.

**Notes**
- This is a simulation: focus on clean merging & clear user feedback.
- Document assumptions (e.g., matching by `id` or `text+category`).

---

## 🧪 Acceptance Checklist

- [ ] **Task 0**: Random quote button works; add-quote form is dynamic; renders correctly.
- [ ] **Task 1**: Quotes persist across reloads; JSON export/import works and updates localStorage.
- [ ] **Task 2**: Category dropdown is dynamic; filtering works; last filter is remembered.
- [ ] **Task 3**: Sync fetches remote changes; conflicts are handled; user is notified.

---

## 🛠️ Implementation Notes

- Keep code **framework-free**—vanilla JS only.
- Use **event delegation** where it simplifies dynamic UIs.
- Validate imported JSON (shape: `[{ text: string, category: string }, ...]`).
- Avoid blocking UI; show feedback (alerts or inline messages) on errors.

---

## ♿ Accessibility & UX

- Use `aria-live="polite"` on the quote display for updates.
- Maintain good contrast and focus states for interactive elements.
- Use semantic HTML for buttons/inputs; avoid clickable `<div>`s.

---

## 🔍 Troubleshooting

- **Import fails**: Check JSON shape; validate before merge.
- **Data not persisting**: Verify localStorage keys and `JSON.parse/JSON.stringify`.
- **File import blocked**: Serve via local server (CORS/file restrictions).

---

## 📌 Roadmap (Optional Enhancements)

- Edit/delete quotes.
- Multi-select category filters.
- Timestamps & IDs for better conflict resolution.
- Basic tests for utility functions.

---

## 👤 Author

Prepared for the ALX Front-End program — **DOM Manipulation, Web Storage & JSON** module.


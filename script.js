// ===== Task 0: Dynamic Quote Generator =====

// Starter quotes (text + category)
let quotes = [
  { text: "Simplicity is the soul of efficiency.", category: "productivity" },
  { text: "Programs must be written for people to read.", category: "software" },
  { text: "First, solve the problem. Then, write the code.", category: "software" },
  { text: "The only way to learn a new programming language is by writing programs in it.", category: "learning" },
  { text: "Performance is a feature.", category: "engineering" },
];

/** Render a quote to #quoteDisplay */
function renderQuote(q) {
  const box = document.getElementById("quoteDisplay");
  if (!q) {
    box.innerHTML = '<p class="muted">No quotes available. Add one below!</p>';
    return;
  }
  box.innerHTML = `
    <div class="quote-text">“${q.text}”</div>
    <div class="quote-meta">Category: <strong>${q.category}</strong></div>
  `;
}

/** REQUIRED: pick & show a random quote */
function showRandomQuote() {
  if (quotes.length === 0) {
    renderQuote(null);
    return;
  }
  const idx = Math.floor(Math.random() * quotes.length);
  renderQuote(quotes[idx]);
}

/** REQUIRED: create the add-quote form dynamically */
function createAddQuoteForm() {
  const mount = document.getElementById("formMount");

  // Wrapper
  const wrapper = document.createElement("div");
  wrapper.className = "row";
  wrapper.id = "addQuoteWrapper";

  // Inputs with the exact IDs the spec shows
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

/** Add a quote from inputs, validate, update view */
function addQuote() {
  const textEl = document.getElementById("newQuoteText");
  const catEl  = document.getElementById("newQuoteCategory");

  const text = (textEl.value || "").trim();
  const category = (catEl.value || "").trim();

  if (!text) { alert("Please enter a quote."); textEl.focus(); return; }
  if (!category) { alert("Please enter a category."); catEl.focus(); return; }

  quotes.push({ text, category });

  // Clear, then render what we just added
  textEl.value = "";
  catEl.value = "";
  renderQuote({ text, category });
}

// Boot
document.addEventListener("DOMContentLoaded", () => {
  // Initial render + wire up button
  showRandomQuote();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  createAddQuoteForm();
});

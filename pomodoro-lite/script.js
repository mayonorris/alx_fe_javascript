// Pomodoro Lite – no deps, < 150 lines
const LS_KEY = "pomodoroLite";
const EL = (id) => document.getElementById(id);

let isRunning = false;
let isBreak = false;
let remaining = 25 * 60; // seconds
let total = remaining;
let tId = null;

// Persist simple settings
function savePrefs() {
  const prefs = {
    work: Number(EL("workMins").value) || 25,
    brk: Number(EL("breakMins").value) || 5,
    sound: EL("soundOn").checked
  };
  localStorage.setItem(LS_KEY, JSON.stringify(prefs));
}

function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    if (p.work) EL("workMins").value = p.work;
    if (p.brk) EL("breakMins").value = p.brk;
    if (typeof p.sound === "boolean") EL("soundOn").checked = p.sound;
  } catch {}
}

function fmt(sec) {
  const m = Math.floor(sec/60).toString().padStart(2,"0");
  const s = Math.floor(sec%60).toString().padStart(2,"0");
  return `${m}:${s}`;
}

function setProgress() {
  const circ = document.querySelector(".ring .fg");
  const C = 2 * Math.PI * 54; // 2πr
  const ratio = Math.max(0, Math.min(1, remaining / total));
  circ.style.strokeDasharray = C;
  circ.style.strokeDashoffset = (1 - ratio) * C;
  circ.style.stroke = isBreak ? "var(--accent-2)" : "var(--accent)";
}

function updateUI(status="") {
  EL("timeLabel").textContent = fmt(remaining);
  EL("modeLabel").textContent = isBreak ? "Break" : "Focus";
  EL("startPauseBtn").textContent = isRunning ? "Pause" : "Start";
  EL("toggleModeBtn").textContent = isBreak ? "Switch to Focus" : "Switch to Break";
  setProgress();
  if (status) EL("status").textContent = status;
}

function bell() {
  if (!EL("soundOn").checked) return;
  // tiny beep via WebAudio
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type="sine"; o.frequency.setValueAtTime(880, ctx.currentTime);
  o.connect(g); g.connect(ctx.destination);
  g.gain.setValueAtTime(0.001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
  o.start(); o.stop(ctx.currentTime + 0.4);
}

function initDurations() {
  const mins = isBreak ? Number(EL("breakMins").value) || 5
                       : Number(EL("workMins").value) || 25;
  total = remaining = Math.max(1, mins) * 60;
}

function start() {
  if (isRunning) return;
  if (remaining <= 0) initDurations();
  isRunning = true;
  EL("status").textContent = "Running…";
  tId = setInterval(tick, 1000);
  updateUI();
}

function pause() {
  isRunning = false;
  clearInterval(tId);
  EL("status").textContent = "Paused";
  updateUI();
}

function reset() {
  isRunning = false;
  clearInterval(tId);
  initDurations();
  EL("status").textContent = "Reset";
  updateUI();
}

function toggleMode() {
  isBreak = !isBreak;
  reset();
  EL("status").textContent = isBreak ? "Break started" : "Focus started";
}

function tick() {
  if (!isRunning) return;
  remaining -= 1;
  if (remaining <= 0) {
    bell();
    isBreak = !isBreak;            // auto-switch when finished
    initDurations();
    EL("status").textContent = isBreak ? "Break time!" : "Focus time!";
  }
  updateUI();
}

document.addEventListener("DOMContentLoaded", () => {
  loadPrefs();
  initDurations();
  updateUI("Ready");

  // Listeners
  EL("startPauseBtn").addEventListener("click", () => {
    isRunning ? pause() : start();
  });
  EL("resetBtn").addEventListener("click", reset);
  EL("toggleModeBtn").addEventListener("click", toggleMode);

  // Save preferences on change
  ["workMins","breakMins","soundOn"].forEach(id => {
    EL(id).addEventListener("change", () => {
      savePrefs();
      if (!isRunning) { initDurations(); updateUI("Durations updated"); }
    });
  });
});

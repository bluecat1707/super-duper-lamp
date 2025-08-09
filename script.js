// Perfect final script — unlock per-person, autosave, auto-lock, dark mode, progress, save/clear/print

const STORAGE_KEY = "nursing_planner_v3";
const AUTOLOCK_MS = 2 * 60 * 1000; // 2 minutes

document.addEventListener("DOMContentLoaded", () => {
  // Buttons
  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const darkModeBtn = document.getElementById("darkModeBtn");
  const printBtn = document.getElementById("printBtn");
  const unlockAhamadBtn = document.getElementById("unlockAhamadBtn");
  const unlockSakshiBtn = document.getElementById("unlockSakshiBtn");

  // Per-person status & timers
  const statusEls = {
    Ahamad: document.getElementById("status-Ahamad"),
    Sakshi: document.getElementById("status-Sakshi")
  };
  const autolockTimers = { Ahamad: null, Sakshi: null };

  // Helpers
  const allElementsWithKey = () => Array.from(document.querySelectorAll("[data-key]"));
  const topicInputs = () => Array.from(document.querySelectorAll("input.topic-input"));
  const checkboxes = () => Array.from(document.querySelectorAll("input[type='checkbox'][data-key]"));
  const subjects = () => Array.from(document.querySelectorAll(".subject"));

  function saveAll(showOwner) {
    const data = {};
    allElementsWithKey().forEach(el => {
      const key = el.dataset.key;
      if (!key) return;
      if (el.type === "checkbox") data[key] = el.checked ? true : false;
      else data[key] = el.value ?? "";
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (showOwner) showSaved(showOwner);
  }

  function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch { data = {}; }
    allElementsWithKey().forEach(el => {
      const key = el.dataset.key;
      if (!key) return;
      if (el.type === "checkbox") {
        el.checked = !!data[key];
      } else {
        el.value = data[key] ?? "";
      }
    });
  }

  function clearAll() {
    if (!confirm("Clear all saved planner data on this device?")) return;
    localStorage.removeItem(STORAGE_KEY);
    allElementsWithKey().forEach(el => {
      if (el.type === "checkbox") el.checked = false;
      else el.value = "";
    });
    updateAllProgress();
    showSaved("Ahamad");
    showSaved("Sakshi");
  }

  function showSaved(owner) {
    const el = statusEls[owner];
    if (!el) return;
    el.textContent = "Saved";
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1400);
  }

  function parseOwnerFromKey(key) {
    if (!key) return null;
    return key.split("::")[0] || null;
  }

  function enableEditingFor(owner) {
    document.querySelectorAll(`input.topic-input[data-owner="${owner}"]`).forEach(i => i.disabled = false);
    // reset autolock
    resetAutoLock(owner);
    showSaved(owner);
  }

  function lockEditingFor(owner) {
    document.querySelectorAll(`input.topic-input[data-owner="${owner}"]`).forEach(i => i.disabled = true);
    // clear timer
    if (autolockTimers[owner]) { clearTimeout(autolockTimers[owner]); autolockTimers[owner] = null; }
    showSaved(owner);
  }

  function resetAutoLock(owner) {
    if (autolockTimers[owner]) clearTimeout(autolockTimers[owner]);
    autolockTimers[owner] = setTimeout(() => {
      lockEditingFor(owner);
      // small message
      const el = statusEls[owner];
      if (el) {
        el.textContent = "Auto-locked";
        el.classList.add("show");
        setTimeout(() => el.classList.remove("show"), 1400);
      }
    }, AUTOLOCK_MS);
  }

  function updateAllProgress() {
    subjects().forEach(subject => {
      const boxes = Array.from(subject.querySelectorAll("input[type='checkbox'][data-key]"));
      const total = boxes.length;
      const checked = boxes.filter(cb => cb.checked).length;
      const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
      const bar = subject.querySelector(".progress-bar");
      if (bar) {
        bar.style.width = percent + "%";
        // coloring (nice)
        if (percent >= 80) bar.style.background = "var(--accent)";
        else if (percent >= 50) bar.style.background = "#f5a623"; // amber
        else bar.style.background = "#e74c3c"; // red
      }
    });
  }

  // EVENTS: autosave on text changes & checkboxes; also reset autolock for owner
  topicInputs().forEach(input => {
    // load disabled state by default
    input.disabled = true;
    input.addEventListener("input", () => {
      const key = input.dataset.key;
      const owner = input.dataset.owner;
      saveAll(owner);
      resetAutoLock(owner);
    });
    // load possible saved value after loadAll()
  });

  checkboxes().forEach(cb => {
    cb.addEventListener("change", () => {
      const key = cb.dataset.key;
      const owner = parseOwnerFromKey(key) || null;
      saveAll(owner);
      updateAllProgress();
      if (owner) resetAutoLock(owner);
    });
  });

  // BUTTONS wiring
  saveBtn.addEventListener("click", () => {
    saveAll("Ahamad");
    saveAll("Sakshi");
    updateAllProgress();
  });

  clearBtn.addEventListener("click", () => {
    clearAll();
  });

  printBtn.addEventListener("click", () => {
    // lock edits before printing
    lockEditingFor("Ahamad"); lockEditingFor("Sakshi");
    updateAllProgress();
    window.print();
  });

  darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("planner_dark", document.body.classList.contains("dark") ? "1" : "0");
  });

  // Unlock Ahamad
  unlockAhamadBtn.addEventListener("click", () => {
    const pass = prompt("Type 'Ahamad' to unlock Ahamad's fields:");
    if (pass && pass.trim().toLowerCase() === "ahamad") {
      enableEditingFor("Ahamad");
      showSaved("Ahamad");
    } else {
      alert("Access denied.");
    }
  });

  // Unlock Sakshi
  unlockSakshiBtn.addEventListener("click", () => {
    const pass = prompt("Type 'Sakshi' to unlock Sakshi's fields:");
    if (pass && pass.trim().toLowerCase() === "sakshi") {
      enableEditingFor("Sakshi");
      showSaved("Sakshi");
    } else {
      alert("Access denied.");
    }
  });

  // Load previously saved
  const themeSaved = localStorage.getItem("planner_dark");
  if (themeSaved === "1") document.body.classList.add("dark");
  loadAll();
  updateAllProgress();

  // ensure UI updates for fields loaded
  // attach dynamic listeners for future new elements
  // (we already bound inputs/checkboxes above, load values now)
  // small helper to re-select after load:
  // show brief saved status on start
  showSaved("Ahamad"); showSaved("Sakshi");
});

// Academic Planner — robust final script
(() => {
  const STORAGE_KEY = "academic_planner_v4";
  const AUTOLOCK_MS = 2 * 60 * 1000; // 2 minutes autolock
  const persons = ["Ahamad", "Sakshi"];

  // per-person autolock timers
  const autolockTimers = { Ahamad: null, Sakshi: null };
  const unlocked = { Ahamad: false, Sakshi: false };

  // helpers
  const q = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // theme
  const themeToggle = q("#themeToggle");
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    if (next === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("planner_theme", next);
  });
  // apply saved theme
  if (localStorage.getItem("planner_theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  // Save & Load whole planner
  function saveAll() {
    const state = {};
    // collect every input with id
    qa("input[id]").forEach(el => {
      if (el.type === "checkbox") state[el.id] = el.checked;
      else state[el.id] = el.value;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadAll() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    let state;
    try { state = JSON.parse(raw); } catch { return; }
    qa("input[id]").forEach(el => {
      if (!(el.id in state)) return;
      if (el.type === "checkbox") el.checked = !!state[el.id];
      else el.value = state[el.id] ?? "";
    });
  }

  // update progress for one subject element
  function updateSubjectProgress(subjectEl) {
    const checkboxes = Array.from(subjectEl.querySelectorAll('input[type="checkbox"]'));
    const total = checkboxes.length;
    const done = checkboxes.filter(cb => cb.checked).length;
    const percent = total ? Math.round((done / total) * 100) : 0;
    const bar = q(".progress-bar", subjectEl);
    if (bar) {
      bar.style.width = `${percent}%`;
      // color by percent (nice touch)
      if (percent >= 80) bar.style.background = "var(--success, #27ae60)";
      else if (percent >= 50) bar.style.background = "#f5a623";
      else bar.style.background = "var(--progress-fill, var(--accent))";
    }
  }

  function updateAllProgress() {
    qa(".subject").forEach(sub => updateSubjectProgress(sub));
  }

  // show "Saved" status briefly for a person
  function flashSaved(person) {
    const section = q(`.person[data-name="${person}"]`);
    if (!section) return;
    const el = q(".save-status", section);
    if (!el) return;
    el.textContent = "Saved";
    el.style.opacity = "1";
    clearTimeout(el._hide);
    el._hide = setTimeout(() => { el.style.opacity = "0"; el.textContent = ""; }, 1300);
  }

  // Enable or disable topic text inputs for person (checkboxes remain editable always)
  function setPersonEditing(person, enable) {
    const section = q(`.person[data-name="${person}"]`);
    if (!section) return;
    // topic text inputs: all text inputs except .fixed-task
    qa('input[type="text"]', section).forEach(input => {
      if (input.classList.contains("fixed-task")) {
        input.disabled = true;
      } else {
        input.disabled = !enable;
      }
    });
    unlocked[person] = !!enable;
    // reset autolock
    resetAutoLock(person);
  }

  function resetAutoLock(person) {
    if (autolockTimers[person]) {
      clearTimeout(autolockTimers[person]);
      autolockTimers[person] = null;
    }
    if (unlocked[person]) {
      autolockTimers[person] = setTimeout(() => {
        // auto-lock
        setPersonEditing(person, false);
        const btn = q(`.person[data-name="${person}"] .unlock-btn`);
        if (btn) btn.textContent = "Unlock";
        const status = q(`.person[data-name="${person}"] .save-status`);
        if (status) { status.textContent = "Auto-locked"; status.style.opacity = "1"; setTimeout(()=>{ status.style.opacity=0; status.textContent="" }, 1400); }
      }, AUTOLOCK_MS);
    }
  }

  // Wire up unlock buttons
  persons.forEach(person => {
    const section = q(`.person[data-name="${person}"]`);
    if (!section) return;
    const btn = q(".unlock-btn", section);
    btn.addEventListener("click", () => {
      // check current state
      const currentlyUnlocked = unlocked[person];
      if (currentlyUnlocked) {
        // lock
        setPersonEditing(person, false);
        btn.textContent = "Unlock";
        saveAll();
        flashSaved(person);
        return;
      }
      // prompt for password (person name)
      const attempt = prompt(`Type "${person}" to unlock ${person}'s topics for editing:`) || "";
      if (attempt.trim().toLowerCase() === person.toLowerCase()) {
        setPersonEditing(person, true);
        btn.textContent = "Lock";
        flashSaved(person);
      } else {
        alert("Incorrect password. Editing not enabled.");
      }
    });
  });

  // Attach listeners to all inputs for save & progress & autolock reset
  function attachListeners() {
    // text inputs
    qa('input[type="text"]').forEach(inp => {
      // make sure topics are disabled by default (locked)
      if (!inp.classList.contains("fixed-task")) inp.disabled = true;
      inp.addEventListener("input", () => {
        saveAll();
        const person = inp.closest(".person")?.getAttribute("data-name");
        if (person) {
          flashSaved(person);
          resetAutoLock(person);
        }
      });
    });

    // checkboxes (always editable)
    qa('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener("change", () => {
        saveAll();
        const subject = cb.closest(".subject");
        if (subject) updateSubjectProgress(subject);
        const person = cb.closest(".person")?.getAttribute("data-name");
        if (person) {
          flashSaved(person);
          // if person was unlocked, reset autolock (activity)
          resetAutoLock(person);
        }
      });
    });
  }

  // Initialize
  loadAll();
  attachListeners();
  // default: lock both persons
  persons.forEach(p => setPersonEditing(p, false));
  // update progress bars (after load)
  updateAllProgress();

  // expose saveAll for debugging (optional)
  window.academicPlanner = { saveAll, loadAll, updateAllProgress, setPersonEditing };
})();

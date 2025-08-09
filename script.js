document.addEventListener("DOMContentLoaded", () => {
  const persons = ["Ahamad", "Sakshi"];
  const TASK_TYPES = ["a1", "a2", "s1", "s2", "clinical", "group"];
  const SUBJECTS = ["nm", "ch", "mh", "mid"]; // Nursing Management, Child Health, Mental Health, Midwifery

  // Toggle Theme Button
  const themeToggle = document.getElementById("themeToggle");
  themeToggle.addEventListener("click", () => {
    if (document.documentElement.getAttribute("data-theme") === "dark") {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  });

  // Load saved theme preference
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }

  persons.forEach(person => {
    const unlockBtn = document.querySelector(`.person.${person.toLowerCase()} .unlock-btn`);
    const saveStatus = document.querySelector(`.person.${person.toLowerCase()} .save-status`);
    const personSection = document.querySelector(`.person.${person.toLowerCase()}`);

    // Initialize: load saved data, lock state and checkboxes
    loadPersonData(person);

    unlockBtn.addEventListener("click", () => {
      const isLocked = unlockBtn.textContent.includes("Unlock");
      toggleLock(person, !isLocked);
      unlockBtn.textContent = isLocked ? "Lock" : "Unlock";
      saveStatus.textContent = isLocked ? "Unlocked for editing" : "Locked";
      if (!isLocked) saveStatus.textContent = "";
    });

    // Attach input listeners for saving and progress update
    SUBJECTS.forEach(subject => {
      TASK_TYPES.forEach(task => {
        // Text input
        const textInput = document.getElementById(`${person}_${subject}_${task}_txt`);
        if (textInput) {
          textInput.addEventListener("input", () => {
            savePersonData(person);
            updateProgressBar(person);
            fadeSaveStatus(saveStatus);
          });
        }
        // Checkbox
        const chkInput = document.getElementById(`${person}_${subject}_${task}_chk`);
        if (chkInput) {
          chkInput.addEventListener("change", () => {
            savePersonData(person);
            updateProgressBar(person);
            fadeSaveStatus(saveStatus);
          });
        }
      });
    });
  });

  // Helper: Enable or disable all inputs for person
  function toggleLock(person, unlock) {
    const personEl = document.querySelector(`.person.${person.toLowerCase()}`);
    const inputs = personEl.querySelectorAll("input[type=text], input[type=checkbox]");
    inputs.forEach(input => {
      // Clinical and Group Project text inputs remain disabled always
      if (input.classList.contains("fixed-task")) return;
      input.disabled = !unlock;
    });
  }

  // Save data for a person in localStorage
  function savePersonData(person) {
    const data = {};
    const personEl = document.querySelector(`.person.${person.toLowerCase()}`);
    const inputs = personEl.querySelectorAll("input[type=text], input[type=checkbox]");
    inputs.forEach(input => {
      if (input.type === "text") {
        data[input.id] = input.value;
      } else if (input.type === "checkbox") {
        data[input.id] = input.checked;
      }
    });
    localStorage.setItem(`planner_${person}`, JSON.stringify(data));
  }

  // Load data for a person from localStorage
  function loadPersonData(person) {
    const dataStr = localStorage.getItem(`planner_${person}`);
    if (!dataStr) return;
    const data = JSON.parse(dataStr);
    const personEl = document.querySelector(`.person.${person.toLowerCase()}`);
    const inputs = personEl.querySelectorAll("input[type=text], input[type=checkbox]");
    inputs.forEach(input => {
      if (data.hasOwnProperty(input.id)) {
        if (input.type === "text") {
          input.value = data[input.id];
        } else if (input.type === "checkbox") {
          input.checked = data[input.id];
        }
      }
    });
    updateProgressBar(person);
  }

  // Update progress bar for a person
  function updateProgressBar(person) {
    const personEl = document.querySelector(`.person.${person.toLowerCase()}`);
    const progressBar = personEl.querySelector(".progress-bar");

    // Count total tasks except fixed-task text inputs (clinical & group)
    // Only checkboxes count for progress
    const checkboxes = personEl.querySelectorAll('input[type="checkbox"]:not(:disabled)');
    if (checkboxes.length === 0) {
      progressBar.style.width = "0%";
      return;
    }
    let completed = 0;
    checkboxes.forEach(chk => {
      if (chk.checked) completed++;
    });

    const percent = Math.round((completed / checkboxes.length) * 100);
    progressBar.style.width = `${percent}%`;
  }

  // Small helper to show "Saved" text briefly
  function fadeSaveStatus(element) {
    element.textContent = "Saved";
    clearTimeout(element._timeout);
    element._timeout = setTimeout(() => {
      element.textContent = "";
    }, 1500);
  }
});

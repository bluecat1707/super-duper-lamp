// ===== THEME TOGGLE =====
const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load saved theme on start
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}

// ===== UNLOCK / LOCK FUNCTIONALITY =====
document.querySelectorAll('.unlock-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const person = btn.getAttribute('data-person');
    const personSection = document.querySelector(`.person.${person.toLowerCase()}`);
    if (!personSection) return;

    // Check if already unlocked (any input not disabled)
    const isUnlocked = Array.from(personSection.querySelectorAll('input[type="text"]')).some(input => !input.disabled);

    if (isUnlocked) {
      // Lock all inputs and checkboxes
      toggleInputs(personSection, false);
      btn.textContent = 'Unlock / Lock';
      saveData();
      alert(`${person} tasks locked.`);
    } else {
      // Prompt password to unlock
      const pass = prompt(`Enter password to unlock ${person}'s tasks:`);

      if (pass && pass.toLowerCase() === person.toLowerCase()) {
        toggleInputs(personSection, true);
        btn.textContent = 'Lock';
        alert(`${person} tasks unlocked. You can now edit.`);
      } else {
        alert('Incorrect password.');
      }
    }
  });
});

// Enable/disable inputs and checkboxes (except fixed tasks always disabled)
function toggleInputs(container, enable) {
  container.querySelectorAll('input[type="text"]').forEach(input => {
    if (!input.classList.contains('fixed-task')) {
      input.disabled = !enable;
    }
  });
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.disabled = !enable;
  });
}

// ===== PROGRESS UPDATE =====
function updateProgress(person) {
  const personSection = document.querySelector(`.person.${person.toLowerCase()}`);
  if (!personSection) return;

  const checkboxes = Array.from(personSection.querySelectorAll('input[type="checkbox"]'));
  // Count only non-disabled checkboxes to avoid counting when locked
  const enabledCheckboxes = checkboxes.filter(cb => !cb.disabled);
  const total = checkboxes.length;
  const completed = checkboxes.filter(cb => cb.checked).length;
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const progressBar = personSection.querySelector('.progress-bar');
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  saveData();
}

// ===== SAVE DATA TO LOCALSTORAGE =====
function saveData() {
  const data = {};
  document.querySelectorAll('.person').forEach(personSection => {
    const person = personSection.getAttribute('data-name');
    data[person] = {
      tasks: [],
      checks: []
    };

    const textInputs = personSection.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
      data[person].tasks.push(input.value);
    });

    const checkboxes = personSection.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      data[person].checks.push(cb.checked);
    });
  });

  localStorage.setItem('academicPlannerData', JSON.stringify(data));
}

// ===== LOAD DATA FROM LOCALSTORAGE =====
function loadData() {
  const saved = localStorage.getItem('academicPlannerData');
  if (!saved) return;

  const data = JSON.parse(saved);
  Object.keys(data).forEach(person => {
    const personSection = document.querySelector(`.person[data-name="${person}"]`);
    if (!personSection) return;

    const textInputs = personSection.querySelectorAll('input[type="text"]');
    const checkboxes = personSection.querySelectorAll('input[type="checkbox"]');

    data[person].tasks.forEach((val, i) => {
      if (textInputs[i]) textInputs[i].value = val;
    });

    data[person].checks.forEach((val, i) => {
      if (checkboxes[i]) checkboxes[i].checked = val;
    });

    // Update progress bar on load
    const progressBar = personSection.querySelector('.progress-bar');
    if (progressBar) {
      const total = checkboxes.length;
      const completed = checkboxes.filter(cb => cb.checked).length;
      const percent = total > 0 ? (completed / total) * 100 : 0;
      progressBar.style.width = `${percent}%`;
    }

    // Lock all on load
    toggleInputs(personSection, false);

    // Update unlock button text accordingly
    const btn = personSection.querySelector('.unlock-btn');
    if (btn) btn.textContent = 'Unlock / Lock';
  });
}

// ===== EVENT LISTENERS FOR CHECKBOX CHANGES =====
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    const personSection = cb.closest('.person');
    if (!personSection) return;
    const person = personSection.getAttribute('data-name');
    updateProgress(person);
  });
});

// ===== INITIALIZE PAGE =====
window.addEventListener('DOMContentLoaded', () => {
  loadData();
});

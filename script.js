/* ===== DOM References ===== */
const unlockBtn = document.getElementById("unlockBtn");
const darkToggle = document.getElementById("darkToggle");
const inputs = document.querySelectorAll(".task input[type='text']");
const checkboxes = document.querySelectorAll(".task input[type='checkbox']");
const progressBars = document.querySelectorAll(".progress-bar");

/* ===== Unlock/Edit Mode ===== */
let editMode = false;
let autoLockTimer;

function unlockEdit() {
  const pin = prompt("Enter your name to unlock (Ahamad or Sakshi):");
  if (pin && (pin.toLowerCase() === "ahamad" || pin.toLowerCase() === "sakshi")) {
    editMode = true;
    inputs.forEach(input => input.removeAttribute("disabled"));
    alert("Edit mode is now ON");
    resetAutoLockTimer();
  } else {
    alert("Access denied!");
  }
}

function lockEdit() {
  editMode = false;
  inputs.forEach(input => input.setAttribute("disabled", "true"));
  alert("Edit mode has been locked");
}

function resetAutoLockTimer() {
  clearTimeout(autoLockTimer);
  autoLockTimer = setTimeout(() => {
    if (editMode) {
      lockEdit();
    }
  }, 10 * 60 * 1000); // 10 minutes
}

/* ===== Local Storage Save/Load ===== */
function saveData() {
  const data = [];
  document.querySelectorAll(".subject-card").forEach(card => {
    const subjectData = {
      title: card.querySelector("h2").textContent,
      sections: []
    };
    card.querySelectorAll(".section").forEach(section => {
      const sectionData = [];
      section.querySelectorAll(".task").forEach(task => {
        sectionData.push({
          checked: task.querySelector("input[type='checkbox']").checked,
          text: task.querySelector("input[type='text']").value
        });
      });
      subjectData.sections.push(sectionData);
    });
    data.push(subjectData);
  });
  localStorage.setItem("plannerData", JSON.stringify(data));
}

function loadData() {
  const saved = localStorage.getItem("plannerData");
  if (!saved) return;
  const data = JSON.parse(saved);
  document.querySelectorAll(".subject-card").forEach((card, i) => {
    card.querySelectorAll(".section").forEach((section, j) => {
      section.querySelectorAll(".task").forEach((task, k) => {
        const taskData = data[i]?.sections[j]?.[k];
        if (taskData) {
          task.querySelector("input[type='checkbox']").checked = taskData.checked;
          task.querySelector("input[type='text']").value = taskData.text;
        }
      });
    });
  });
  updateProgress();
}

/* ===== Progress Calculation ===== */
function updateProgress() {
  document.querySelectorAll(".subject-card").forEach((card, i) => {
    const tasks = card.querySelectorAll("input[type='checkbox']");
    const completed = [...tasks].filter(cb => cb.checked).length;
    const percent = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
    progressBars[i].style.width = percent + "%";
    if (percent >= 80) progressBars[i].style.background = "#4CAF50";
    else if (percent >= 50) progressBars[i].style.background = "#FFC107";
    else progressBars[i].style.background = "#F44336";
  });
}

/* ===== Dark Mode Toggle ===== */
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
});

/* ===== Event Listeners ===== */
unlockBtn.addEventListener("click", unlockEdit);

inputs.forEach(input => {
  input.addEventListener("input", () => {
    if (editMode) {
      saveData();
      resetAutoLockTimer();
    }
  });
});

checkboxes.forEach(cb => {
  cb.addEventListener("change", () => {
    saveData();
    updateProgress();
  });
});

/* ===== Init ===== */
window.addEventListener("load", () => {
  loadData();
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }
  updateProgress();
});

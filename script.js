// ===== GLOBAL VARIABLES =====
let editMode = false;
let editTimer;

// ===== SELECTORS =====
const unlockBtn = document.getElementById("unlockBtn");
const darkModeBtn = document.getElementById("darkModeBtn");
const printBtn = document.getElementById("printBtn");
const namePrompt = () => prompt("Enter your name to unlock:");

// ===== INITIAL LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();
    updateAllProgress();
});

// ===== UNLOCK / LOCK EDIT MODE =====
unlockBtn.addEventListener("click", () => {
    if (!editMode) {
        const name = namePrompt();
        if (name && (name.toLowerCase() === "ahamad" || name.toLowerCase() === "sakshi")) {
            enableEdit();
            alert(`Edit mode unlocked for ${name}`);
        } else {
            alert("Access denied. Only Ahamad or Sakshi can unlock.");
        }
    } else {
        disableEdit();
        alert("Edit mode locked.");
    }
});

function enableEdit() {
    editMode = true;
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.disabled = false;
    });
    unlockBtn.textContent = "Lock";
    resetEditTimer();
}

function disableEdit() {
    editMode = false;
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.disabled = true;
    });
    unlockBtn.textContent = "Unlock";
    clearTimeout(editTimer);
}

function resetEditTimer() {
    clearTimeout(editTimer);
    editTimer = setTimeout(() => {
        disableEdit();
        alert("Edit mode auto-locked after 10 minutes of inactivity.");
    }, 10 * 60 * 1000); // 10 minutes
}

// ===== SAVE & LOAD =====
function saveToStorage() {
    const data = [];
    document.querySelectorAll(".task").forEach(task => {
        const checkbox = task.querySelector('input[type="checkbox"]').checked;
        const text = task.querySelector('input[type="text"]').value;
        data.push({ checkbox, text });
    });
    localStorage.setItem("plannerData", JSON.stringify(data));
}

function loadFromStorage() {
    const storedData = JSON.parse(localStorage.getItem("plannerData"));
    if (storedData) {
        document.querySelectorAll(".task").forEach((task, index) => {
            if (storedData[index]) {
                task.querySelector('input[type="checkbox"]').checked = storedData[index].checkbox;
                task.querySelector('input[type="text"]').value = storedData[index].text;
            }
        });
    }
}

// ===== PROGRESS BAR =====
function updateAllProgress() {
    document.querySelectorAll(".subject-card").forEach(subjectCard => {
        const checkboxes = subjectCard.querySelectorAll('input[type="checkbox"]');
        const total = checkboxes.length;
        const completed = Array.from(checkboxes).filter(cb => cb.checked).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        const progressBar = subjectCard.querySelector(".progress-bar");
        if (progressBar) {
            progressBar.style.width = percentage + "%";
            if (percentage >= 80) {
                progressBar.style.backgroundColor = "#27ae60"; // Green
            } else if (percentage >= 50) {
                progressBar.style.backgroundColor = "#f1c40f"; // Yellow
            } else {
                progressBar.style.backgroundColor = "#e74c3c"; // Red
            }
        }
    });
}

// ===== CHECKBOX & INPUT EVENTS =====
document.addEventListener("input", e => {
    if (e.target.type === "text" || e.target.type === "checkbox") {
        saveToStorage();
        updateAllProgress();
        if (editMode) resetEditTimer();
    }
});

// ===== DARK MODE TOGGLE =====
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
});

// Load dark mode preference
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
}

// ===== PRINT BUTTON =====
printBtn.addEventListener("click", () => {
    window.print();
});

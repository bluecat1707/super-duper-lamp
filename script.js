// ===== Select Elements =====
const unlockBtn = document.getElementById("unlock-btn");
const darkModeBtn = document.getElementById("dark-mode-btn");
const allTopicInputs = document.querySelectorAll(".topic-input");
const allCheckboxes = document.querySelectorAll(".checklist input[type='checkbox']");

// ===== Local Storage Keys =====
const STORAGE_KEY = "nursingPlannerData";
const DARK_MODE_KEY = "nursingPlannerDarkMode";

// ===== Load Saved Data =====
function loadFromStorage() {
    const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (savedData) {
        // Restore inputs
        allTopicInputs.forEach(input => {
            if (savedData[input.id] !== undefined) {
                input.value = savedData[input.id];
            }
        });
        // Restore checkboxes
        allCheckboxes.forEach(checkbox => {
            if (savedData[checkbox.id] !== undefined) {
                checkbox.checked = savedData[checkbox.id];
            }
        });
    }

    // Restore dark mode
    const darkMode = localStorage.getItem(DARK_MODE_KEY);
    if (darkMode === "true") {
        document.body.classList.add("dark");
    }
}

// ===== Save Data =====
function saveToStorage() {
    const data = {};
    allTopicInputs.forEach(input => {
        data[input.id] = input.value;
    });
    allCheckboxes.forEach(checkbox => {
        data[checkbox.id] = checkbox.checked;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ===== Update Progress Bars =====
function updateAllProgress() {
    document.querySelectorAll(".subject").forEach(subject => {
        const checkboxes = subject.querySelectorAll("input[type='checkbox']");
        if (checkboxes.length > 0) {
            const completed = [...checkboxes].filter(cb => cb.checked).length;
            const percent = Math.round((completed / checkboxes.length) * 100);
            const bar = subject.querySelector(".progress-bar");
            if (bar) {
                bar.style.width = percent + "%";
            }
        }
    });
}

// ===== Unlock Editing =====
function unlockEditing() {
    const name = prompt("Enter your name to unlock (Ahamad or Sakshi):");
    if (name && (name.toLowerCase() === "ahamad" || name.toLowerCase() === "sakshi")) {
        allTopicInputs.forEach(input => input.disabled = false);
        alert("Editing unlocked for " + name);
        setTimeout(() => {
            allTopicInputs.forEach(input => input.disabled = true);
            alert("Editing locked again for security.");
        }, 10 * 60 * 1000); // Auto-lock after 10 minutes
    } else {
        alert("Access denied.");
    }
}

// ===== Toggle Dark Mode =====
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem(DARK_MODE_KEY, document.body.classList.contains("dark"));
}

// ===== Event Listeners =====
unlockBtn.addEventListener("click", unlockEditing);
darkModeBtn.addEventListener("click", toggleDarkMode);

allTopicInputs.forEach(input => {
    input.addEventListener("input", () => {
        saveToStorage();
    });
});

allCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        saveToStorage();
        updateAllProgress();
    });
});

// ===== Initialize =====
loadFromStorage();
updateAllProgress();

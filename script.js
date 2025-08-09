// === DARK MODE TOGGLE ===
document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
}

// === UNLOCK EDIT MODE ===
document.querySelectorAll(".unlock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const person = btn.getAttribute("data-person");
        const pass = prompt(`Enter password to unlock ${person}'s tasks:`);

        if (pass && pass.toLowerCase() === person.toLowerCase()) {
            document.querySelectorAll(`.${person} input[type="text"]`).forEach(input => {
                input.removeAttribute("readonly");
            });
            alert(`${person}'s tasks are now editable!`);
        } else {
            alert("Incorrect password!");
        }
    });
});

// === UPDATE PROGRESS ===
function updateProgress(person) {
    const totalTasks = document.querySelectorAll(`.${person} input[type="checkbox"]`).length;
    const completedTasks = document.querySelectorAll(`.${person} input[type="checkbox"]:checked`).length;

    const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    document.querySelector(`.${person} .progress-bar`).style.width = `${progressPercent}%`;

    saveData();
}

// === SAVE DATA ===
function saveData() {
    const data = {};
    document.querySelectorAll(".person").forEach(personDiv => {
        const person = personDiv.classList[1]; // e.g., ahamad, sakshi
        data[person] = {
            tasks: [],
            checkboxes: []
        };

        personDiv.querySelectorAll('input[type="text"]').forEach(input => {
            data[person].tasks.push(input.value);
        });

        personDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            data[person].checkboxes.push(cb.checked);
        });
    });
    localStorage.setItem("plannerData", JSON.stringify(data));
}

// === LOAD DATA ===
function loadData() {
    const saved = localStorage.getItem("plannerData");
    if (!saved) return;
    const data = JSON.parse(saved);

    Object.keys(data).forEach(person => {
        const personData = data[person];
        const textInputs = document.querySelectorAll(`.${person} input[type="text"]`);
        const checkboxes = document.querySelectorAll(`.${person} input[type="checkbox"]`);

        personData.tasks.forEach((val, i) => {
            if (textInputs[i]) textInputs[i].value = val;
        });

        personData.checkboxes.forEach((val, i) => {
            if (checkboxes[i]) checkboxes[i].checked = val;
        });

        updateProgress(person);
    });
}

// === EVENT LISTENERS FOR CHECKBOXES ===
document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener("change", () => {
        const person = cb.closest(".person").classList[1];
        updateProgress(person);
    });
});

// === INITIAL LOAD ===
loadData();

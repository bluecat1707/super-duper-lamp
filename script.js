document.addEventListener("DOMContentLoaded", () => {
    const unlockButtons = document.querySelectorAll(".unlock-btn");
    const progressBars = document.querySelectorAll(".progress-bar");
    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    const textInputs = document.querySelectorAll("input[type='text']");
    const saveStatusEls = document.querySelectorAll(".save-status");
    const themeToggle = document.getElementById("themeToggle");

    let unlockTimeout;

    // Unlock editing for selected person
    unlockButtons.forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const pass = prompt(`Enter name to unlock ${name}'s tasks:`);

            if (pass && pass.toLowerCase() === name.toLowerCase()) {
                enableEditing(name);
                showSaveStatus(name, "Unlocked! You can now edit.");
                clearTimeout(unlockTimeout);
                unlockTimeout = setTimeout(() => lockEditing(name), 2 * 60 * 1000); // Auto lock in 2 mins
            } else {
                alert("Incorrect name!");
            }
        });
    });

    function enableEditing(name) {
        document.querySelectorAll(`.person[data-name="${name}"] input[type='text']`)
            .forEach(input => input.disabled = false);
    }

    function lockEditing(name) {
        document.querySelectorAll(`.person[data-name="${name}"] input[type='text']`)
            .forEach(input => input.disabled = true);
        showSaveStatus(name, "Locked again for security.");
    }

    // Save changes to localStorage
    textInputs.forEach(input => {
        input.addEventListener("input", () => {
            localStorage.setItem(input.id, input.value);
            updateProgress();
            showSaveStatus(getParentName(input), "Saved!");
        });

        // Load saved data
        const saved = localStorage.getItem(input.id);
        if (saved) input.value = saved;
    });

    // Checkbox handling
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            localStorage.setItem(checkbox.id, checkbox.checked);
            updateProgress();
            showSaveStatus(getParentName(checkbox), "Saved!");
        });

        // Load saved state
        const saved = localStorage.getItem(checkbox.id);
        if (saved === "true") checkbox.checked = true;
    });

    // Update all progress bars
    function updateProgress() {
        document.querySelectorAll(".subject").forEach(subject => {
            const boxes = subject.querySelectorAll("input[type='checkbox']");
            const total = boxes.length;
            const checked = subject.querySelectorAll("input[type='checkbox']:checked").length;
            const percent = total > 0 ? (checked / total) * 100 : 0;
            const bar = subject.querySelector(".progress-bar");
            if (bar) bar.style.width = `${percent}%`;
        });
    }

    // Show save status
    function showSaveStatus(personName, message) {
        const statusEl = document.querySelector(`.person[data-name="${personName}"] .save-status`);
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.classList.add("show");
            setTimeout(() => statusEl.classList.remove("show"), 1500);
        }
    }

    // Helper to get parent person name
    function getParentName(el) {
        return el.closest(".person").dataset.name;
    }

    // Theme toggle
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    });

    // Load theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }

    // Initial progress update
    updateProgress();
});

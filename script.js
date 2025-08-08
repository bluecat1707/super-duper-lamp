const subjects = [
    {
        name: "Nursing Management",
        color: "#1abc9c",
        sections: ["Clinical", "Assignment 1", "Assignment 2", "Seminar 1", "Seminar 2"]
    },
    {
        name: "Child Health Nursing 2",
        color: "#3498db",
        sections: ["Clinical", "Assignment 1", "Assignment 2", "Seminar 1", "Seminar 2"]
    },
    {
        name: "Mental Health Nursing 2",
        color: "#9b59b6",
        sections: ["Clinical", "Assignment 1", "Assignment 2", "Seminar 1", "Seminar 2"]
    },
    {
        name: "Midwifery",
        color: "#e67e22",
        sections: ["Clinical", "Assignment 1", "Assignment 2", "Seminar 1", "Seminar 2"]
    }
];

function createPlanner() {
    const planner = document.getElementById("planner");

    subjects.forEach(subject => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.setProperty("--card-color", subject.color);

        const title = document.createElement("h2");
        title.textContent = subject.name;
        card.appendChild(title);

        subject.sections.forEach(sectionName => {
            const section = document.createElement("div");
            section.className = "section";

            const sectionTitle = document.createElement("h3");
            sectionTitle.textContent = sectionName;
            section.appendChild(sectionTitle);

            const task = document.createElement("div");
            task.className = "task";

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Write topic here...";
            input.value = loadData(subject.name, sectionName);

            input.addEventListener("input", () => {
                saveData(subject.name, sectionName, input.value);
            });

            const clearBtn = document.createElement("button");
            clearBtn.textContent = "Clear";
            clearBtn.className = "clear-btn";
            clearBtn.addEventListener("click", () => {
                input.value = "";
                saveData(subject.name, sectionName, "");
            });

            task.appendChild(input);
            task.appendChild(clearBtn);
            section.appendChild(task);

            card.appendChild(section);
        });

        planner.appendChild(card);
    });
}

// Save data in localStorage
function saveData(subject, section, value) {
    const key = `${subject}_${section}`;
    localStorage.setItem(key, value);
}

// Load data from localStorage
function loadData(subject, section) {
    const key = `${subject}_${section}`;
    return localStorage.getItem(key) || "";
}

createPlanner();

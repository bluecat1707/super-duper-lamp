/* script.js
   Makes the static planner editable online:
   - Adds toolbar
   - Edit mode toggles textareas for each Ahamad/Sakshi field
   - Autosaves to localStorage
   - Clear and Export (print) functions
*/

(function () {
  const STORAGE_PREFIX = "planner_v1"; // change if you want fresh storage later

  // Build toolbar under header
  function buildToolbar() {
    const header = document.querySelector("header");
    const toolbar = document.createElement("div");
    toolbar.id = "planner-toolbar";
    toolbar.style.cssText = "display:flex;gap:8px;justify-content:center;margin:12px 0;flex-wrap:wrap";

    const editBtn = createBtn("Edit", "✏️");
    const saveBtn = createBtn("Save", "💾");
    const clearBtn = createBtn("Clear All", "🗑️");
    const exportBtn = createBtn("Export / Print", "📤");

    toolbar.append(editBtn, saveBtn, clearBtn, exportBtn);
    header.insertAdjacentElement("afterend", toolbar);

    editBtn.addEventListener("click", toggleEditMode);
    saveBtn.addEventListener("click", saveAll);
    clearBtn.addEventListener("click", () => {
      if (confirm("Clear ALL saved planner entries? This cannot be undone.")) {
        clearAll();
      }
    });
    exportBtn.addEventListener("click", () => {
      // trigger print (user can choose Save as PDF)
      window.print();
    });

    // keyboard shortcut: Ctrl/Cmd+E to toggle edit
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        toggleEditMode();
      }
    });
  }

  function createBtn(text, emoji) {
    const btn = document.createElement("button");
    btn.className = "planner-btn";
    btn.type = "button";
    btn.innerHTML = `<span style="margin-right:6px">${emoji}</span>${text}`;
    btn.style.cssText = `
      background:#fff;border:1px solid #ddd;padding:8px 12px;border-radius:8px;
      box-shadow:0 2px 6px rgba(0,0,0,0.04);cursor:pointer;font-weight:600;
    `;
    btn.onmouseover = () => (btn.style.transform = "translateY(-2px)");
    btn.onmouseout = () => (btn.style.transform = "translateY(0)");
    return btn;
  }

  // Find every multi-line block and give it a data-key so we can save/load easily
  function indexFields() {
    const subjects = Array.from(document.querySelectorAll(".subject"));
    subjects.forEach((sub) => {
      const subjectTitle = sub.querySelector("h2")?.textContent?.trim() || "Subject";
      // for each .section inside subject
      const sections = Array.from(sub.querySelectorAll(".section"));
      sections.forEach((sec) => {
        const sectionTitle = sec.querySelector("h3")?.textContent?.trim();
        // if it's a clinical block (no names), it may not have .names
        const namesWrapper = sec.querySelector(".names");
        if (!namesWrapper) return;

        const nameDivs = Array.from(namesWrapper.children);
        nameDivs.forEach((nd, idx) => {
          // strong text contains owner name (Ahamad / Sakshi)
          const ownerEl = nd.querySelector("strong");
          const owner = ownerEl ? ownerEl.textContent.replace(":", "").trim() : `owner${idx}`;
          let box = nd.querySelector(".multi-line");
          if (!box) {
            // if user modified HTML, try to find an existing element
            box = document.createElement("div");
            box.className = "multi-line";
            nd.appendChild(box);
          }
          // attach keys
          const key = makeKey(subjectTitle, sectionTitle, owner);
          box.dataset.plannerKey = key;
        });
      });
    });
  }

  function makeKey(subject, section, owner) {
    // safe key without spaces or special chars
    return `${STORAGE_PREFIX}::${escapeKey(subject)}::${escapeKey(section)}::${escapeKey(owner)}`;
  }
  function escapeKey(s) {
    return String(s).replace(/\s+/g, "_").replace(/[^\w-]/g, "");
  }

  // Toggle Edit Mode
  let isEdit = false;
  function toggleEditMode() {
    isEdit = !isEdit;
    document.querySelectorAll(".multi-line").forEach((box) => {
      if (isEdit) enableEditBox(box);
      else disableEditBox(box);
    });
    // update toolbar button label
    const editBtn = document.querySelector("#planner-toolbar button");
    if (editBtn) editBtn.innerHTML = `${isEdit ? "🛑 Stop" : "✏️ Edit"}`;
  }

  // Replace multi-line div with textarea (or enhance it)
  function enableEditBox(box) {
    if (box.dataset.editable === "1") return;
    // create textarea
    const ta = document.createElement("textarea");
    ta.className = "planner-textarea";
    ta.style.cssText = "width:100%;min-height:54px;resize:vertical;padding:8px;border:1px dashed #bbb;border-radius:6px;font-family:inherit;font-size:14px;";
    ta.placeholder = "Type topic or details here...";
    // load saved value if exists
    const saved = localStorage.getItem(box.dataset.plannerKey);
    if (saved) ta.value = saved;
    // replace box visually with ta (but keep box in DOM for print/static fallback)
    box.style.display = "none";
    box.parentElement.appendChild(ta);
    // autosave on input (debounced)
    let timeout = null;
    ta.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        localStorage.setItem(box.dataset.plannerKey, ta.value);
      }, 350);
    });
    // mark
    box.dataset.editable = "1";
    box._ta = ta;
  }

  function disableEditBox(box) {
    if (box.dataset.editable !== "1") return;
    const ta = box._ta;
    if (ta) {
      // final save
      localStorage.setItem(box.dataset.plannerKey, ta.value);
      ta.remove();
    }
    box.style.display = ""; // back to visible
    box.dataset.editable = "0";
  }

  function saveAll() {
    // collect all textareas and save
    document.querySelectorAll(".planner-textarea").forEach((ta) => {
      // find associated box (previous sibling .multi-line or parent)
      const parent = ta.parentElement;
      const box = parent.querySelector(".multi-line");
      if (box && box.dataset.plannerKey) {
        localStorage.setItem(box.dataset.plannerKey, ta.value);
      }
    });
    // also ensure non-edit textarea values are saved to maintain consistency
    // (load visual boxes for print)
    syncBoxesFromStorage();
    alert("Saved locally on this device ✅");
  }

  // Load saved values into the printable .multi-line boxes (for print preview)
  function syncBoxesFromStorage() {
    document.querySelectorAll(".multi-line").forEach((box) => {
      const key = box.dataset.plannerKey;
      if (!key) return;
      const v = localStorage.getItem(key);
      // Display small preview text inside the dashed box for print/digital view
      if (v && v.trim().length > 0) {
        // convert newlines to <br> but keep short preview formatting
        box.innerHTML = v.split("\n").map(line => escapeHtml(line)).join("<br>");
      } else {
        box.innerHTML = ""; // keep it blank if no saved value
      }
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
  }

  function clearAll() {
    // clear planner keys from localStorage
    document.querySelectorAll(".multi-line").forEach((box) => {
      const key = box.dataset.plannerKey;
      if (key) localStorage.removeItem(key);
      box.innerHTML = "";
      // if textarea exists, clear it too
      if (box._ta) box._ta.value = "";
    });
    alert("All planner entries cleared from this device.");
  }

  function loadAllToEdit() {
    // if there are existing saved values, and currently in edit mode, populate textareas
    document.querySelectorAll(".multi-line").forEach((box) => {
      const key = box.dataset.plannerKey;
      const saved = key ? localStorage.getItem(key) : null;
      if (saved && box.dataset.editable === "1" && box._ta) {
        box._ta.value = saved;
      } else if (saved && box.dataset.editable !== "1") {
        // update printed preview
        box.innerHTML = saved.split("\n").map(line => escapeHtml(line)).join("<br>");
      }
    });
  }

  // On load: index fields, build toolbar, sync saved values
  function init() {
    indexFields();
    buildToolbar();

    // give each multi-line a visible dashed placeholder (if empty)
    document.querySelectorAll(".multi-line").forEach((box) => {
      box.style.minHeight = "56px";
      box.style.padding = "6px";
      box.style.borderBottom = "1px dashed #999";
    });

    // load existing saved values into the view
    syncBoxesFromStorage();

    // If user double clicks any multi-line in view mode, switch to edit quickly
    document.addEventListener("dblclick", (e) => {
      const m = e.target.closest(".multi-line");
      if (m) {
        if (!isEdit) toggleEditMode();
        // after enabling, focus the created textarea if any
        setTimeout(() => {
          if (m._ta) m._ta.focus();
        }, 120);
      }
    });

    // ensure loaded content refresh before print
    window.addEventListener("beforeprint", () => {
      // hide editing textareas and show final preview
      if (isEdit) toggleEditMode();
      syncBoxesFromStorage();
    });

    // load to edit if any textareas get inserted later
    // small interval to auto-load any persisted values into textareas when edit mode opens
    setInterval(loadAllToEdit, 800);
  }

  // kick things off
  document.addEventListener("DOMContentLoaded", init);
})();

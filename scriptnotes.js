// DOM Element Bindings
const sidebar = document.getElementById('sidebar-widget');
const toggleTab = document.getElementById('toggle-tab');
const tabJot = document.getElementById('tab-jot');
const tabCheck = document.getElementById('tab-check');
const inputArea = document.getElementById('widget-input');
const addBtn = document.getElementById('add-btn');
const jotContainer = document.getElementById('jot-container');
const checkContainer = document.getElementById('check-container');

// State Engine
let currentMode = 'jot'; // 'jot' or 'check'
let datastore = JSON.parse(localStorage.getItem('widget-data')) || { jots: [], checklist: [], theme: { light: '#ffccd5', dark: '#ff758f' } };

// Expand/Collapse Sidebar
toggleTab.addEventListener('click', () => sidebar.classList.toggle('open'));

// Color Customizer Listener
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
        document.querySelector('.color-dot.active').classList.remove('active');
        e.target.classList.add('active');
        
        datastore.theme.light = e.target.getAttribute('data-color');
        datastore.theme.dark = e.target.getAttribute('data-dark');
        applyTheme();
        saveData();
    });
});

function applyTheme() {
    document.documentElement.style.setProperty('--theme-light', datastore.theme.light);
    document.documentElement.style.setProperty('--theme-dark', datastore.theme.dark);
}

// Mode Switchers
tabJot.addEventListener('click', () => switchMode('jot'));
tabCheck.addEventListener('click', () => switchMode('check'));

function switchMode(mode) {
    currentMode = mode;
    if (mode === 'jot') {
        tabJot.classList.add('active');
        tabCheck.classList.remove('active');
        jotContainer.classList.remove('hidden');
        checkContainer.classList.add('hidden');
        inputArea.placeholder = "Type a quick note... 📝";
    } else {
        tabCheck.classList.add('active');
        tabJot.classList.remove('active');
        checkContainer.classList.remove('hidden');
        jotContainer.classList.add('hidden');
        inputArea.placeholder = "Add a todo task... 👑";
    }
}

// Render Engine
function render() {
    // 1. Jot Notes
    jotContainer.innerHTML = '';
    datastore.jots.forEach((text, idx) => {
        const div = document.createElement('div');
        div.className = 'card-item';
        div.innerHTML = `<div class="item-content">📌 ${text}</div><button class="delete-btn" onclick="removeItem('jots', ${idx})">×</button>`;
        jotContainer.appendChild(div);
    });

    // 2. Checklist items
    checkContainer.innerHTML = '';
    datastore.checklist.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'card-item';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = `item-content ${item.done ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.done;
        checkbox.onclick = () => {
            datastore.checklist[idx].done = !datastore.checklist[idx].done;
            saveData();
            render();
        };

        const textSpan = document.createElement('span');
        textSpan.textContent = item.text;

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(textSpan);
        
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '×';
        delBtn.onclick = () => removeItem('checklist', idx);

        div.appendChild(contentDiv);
        div.appendChild(delBtn);
        checkContainer.appendChild(div);
    });
}

// Add Item Handlers
addBtn.addEventListener('click', () => {
    const value = inputArea.value.trim();
    if (!value) return;

    if (currentMode === 'jot') {
        datastore.jots.push(value);
    } else {
        datastore.checklist.push({ text: value, done: false });
    }
    inputArea.value = '';
    saveData();
    render();
});

window.removeItem = function(arrayKey, index) {
    datastore[arrayKey].splice(index, 1);
    saveData();
    render();
};

function saveData() {
    localStorage.setItem('widget-data', JSON.stringify(datastore));
}

// Initializing application state
applyTheme();
render();

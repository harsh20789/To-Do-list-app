// Task Manager Application
// Load saved tasks or start with empty array
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];

// Get all the DOM elements we need
const form = document.querySelector('#task-form');
const taskInput = document.querySelector('#todo-input');
const descInput = document.querySelector('#description-input');
const prioritySelect = document.querySelector('#priority-select');
const dateInput = document.querySelector('#due-date-input');
const taskList = document.querySelector('#todo-list');
const searchBox = document.querySelector('#search-input');
const filterDropdown = document.querySelector('#filter-select');
const progressText = document.querySelector('#progress-text');
const totalTasks = document.querySelector('#task-count');
const progressBar = document.querySelector('#progress-bar');
const themeBtn = document.querySelector('#theme-toggle');
const themeIcon = document.querySelector('#theme-icon');
const statsContainer = document.querySelector('#analytics-container');

// Save tasks to local storage
function saveToStorage() {
  localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Display all tasks with current filters
function showTasks() {
  const searchText = searchBox.value.toLowerCase();
  const filterValue = filterDropdown.value;

  // Filter tasks based on search and filter
  const filtered = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchText) || 
                         (task.description && task.description.toLowerCase().includes(searchText));
    const matchesFilter = filterValue === 'all' || 
                         (filterValue === 'completed' && task.completed) || 
                         (filterValue === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });

  // Clear current list
  taskList.innerHTML = '';

  // Add each task to the list
  filtered.forEach(task => {
    const taskEl = document.createElement('div');
    taskEl.className = `task-entry p-3 bg-gray-50 dark:bg-slate-700 rounded-lg ${task.completed ? 'opacity-75' : ''}`;
    
    // Priority color coding
    let priorityClass, priorityLabel;
    if (task.priority === 'high') {
      priorityClass = 'bg-red-100 text-red-800';
      priorityLabel = '❗ High';
    } else if (task.priority === 'medium') {
      priorityClass = 'bg-yellow-100 text-yellow-800';
      priorityLabel = '🟡 Medium';
    } else {
      priorityClass = 'bg-green-100 text-green-800';
      priorityLabel = '🟢 Low';
    }

    taskEl.innerHTML = `
      <div class="flex justify-between">
        <div class="flex items-start gap-3">
          <input type="checkbox" ${task.completed ? 'checked' : ''} 
                 class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700">
          <div>
            <h3 class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">
              ${task.text}
            </h3>
            ${task.description ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1">${task.description}</p>` : ''}
            ${task.dueDate ? `<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">📅 ${formatDate(task.dueDate)}</p>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs px-2 py-1 ${priorityClass} rounded-full">${priorityLabel}</span>
          <button class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" data-action="edit">
            <span class="material-icons text-sm">edit</span>
          </button>
          <button class="p-1 text-red-400 hover:text-red-500" data-action="delete">
            <span class="material-icons text-sm">delete</span>
          </button>
        </div>
      </div>
      ${task.tags && task.tags.length ? `
      <div class="mt-2 flex flex-wrap gap-1">
        ${task.tags.map(tag => `
          <span class="text-xs px-2 py-1 ${getTagColor(tag)} rounded-full">${tag}</span>
        `).join('')}
      </div>` : ''}
    `;
    
    taskList.appendChild(taskEl);
  });

  updateStats();
  showAnalytics();
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function for tag colors
function getTagColor(tag) {
  switch(tag) {
    case 'Work': return 'bg-blue-100 text-blue-800';
    case 'Personal': return 'bg-green-100 text-green-800';
    case 'Urgent': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Update progress and counters
function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  
  progressText.textContent = `${done} completed`;
  totalTasks.textContent = `${total} tasks`;
  progressBar.style.width = total ? `${(done / total) * 100}%` : '0';
}

// Show analytics panel
function showAnalytics() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const percent = total ? Math.round((done / total) * 100) : 0;

  statsContainer.innerHTML = `
    <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
      <h3 class="font-medium text-gray-800 dark:text-white mb-3">Task Overview</h3>
      <div class="grid grid-cols-3 gap-4 text-center mb-3">
        <div>
          <div class="text-2xl font-bold">${total}</div>
          <div class="text-xs text-gray-500">Total</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-green-500">${done}</div>
          <div class="text-xs text-gray-500">Done</div>
        </div>
        <div>
          <div class="text-2xl font-bold text-blue-500">${pending}</div>
          <div class="text-xs text-gray-500">Remaining</div>
        </div>
      </div>
      <div class="bg-gray-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div class="bg-blue-500 h-full" style="width: ${percent}%"></div>
      </div>
    </div>
  `;
}

// Theme management
function setTheme(isDark) {
  localStorage.setItem('appTheme', isDark ? 'dark' : 'light');
  document.documentElement.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? 'light_mode' : 'dark_mode';
}

function loadTheme() {
  const savedTheme = localStorage.getItem('appTheme');
  setTheme(savedTheme === 'dark');
}

// Event listeners
form.addEventListener('submit', e => {
  e.preventDefault();
  const title = taskInput.value.trim();
  
  if (title) {
    tasks.push({
      text: title,
      description: descInput.value.trim(),
      priority: prioritySelect.value,
      dueDate: dateInput.value,
      tags: ['Work'], // TODO: Add proper tag selection
      completed: false,
      createdAt: new Date().toISOString()
    });
    
    saveToStorage();
    showTasks();
    form.reset();
    taskInput.focus();
  }
});

taskList.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  
  const taskEl = e.target.closest('.task-entry');
  const index = [...taskList.children].indexOf(taskEl);
  const filteredTasks = getFilteredTasks();
  
  if (btn.dataset.action === 'delete') {
    tasks = tasks.filter(t => t !== filteredTasks[index]);
    saveToStorage();
    showTasks();
  } 
  else if (btn.dataset.action === 'edit') {
    const newTitle = prompt('Edit task:', filteredTasks[index].text);
    if (newTitle && newTitle.trim()) {
      filteredTasks[index].text = newTitle.trim();
      saveToStorage();
      showTasks();
    }
  }
});

// Helper to get currently filtered tasks
function getFilteredTasks() {
  const searchText = searchBox.value.toLowerCase();
  const filterValue = filterDropdown.value;
  
  return tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchText) || 
                         (task.description && task.description.toLowerCase().includes(searchText));
    const matchesFilter = filterValue === 'all' || 
                         (filterValue === 'completed' && task.completed) || 
                         (filterValue === 'pending' && !task.completed);
    return matchesSearch && matchesFilter;
  });
}

// Initialize
loadTheme();
showTasks();

// Theme toggle
themeBtn.addEventListener('click', () => {
  const isDark = !document.documentElement.classList.contains('dark');
  setTheme(isDark);
});

// Search and filter events
searchBox.addEventListener('input', showTasks);
filterDropdown.addEventListener('change', showTasks);
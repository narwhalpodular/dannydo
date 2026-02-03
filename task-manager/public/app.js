// API Base URL - change this if deploying to a different server
const API_URL = window.location.origin + '/api';

let tasks = [];
let draggedTaskId = null;

// Fetch all tasks from the database
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to load tasks');
        tasks = await response.json();
        renderAllTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        showError('Failed to load tasks. Please refresh the page.');
    }
}

// Add new task
async function addTask() {
    const input = document.getElementById('newTaskInput');
    const text = input.value.trim();
    
    if (text === '') return;

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                day: 'pool',
                completed: 0,
                position: tasks.filter(t => t.day === 'pool').length
            })
        });

        if (!response.ok) throw new Error('Failed to create task');
        
        const newTask = await response.json();
        tasks.push(newTask);
        input.value = '';
        renderAllTasks();
    } catch (error) {
        console.error('Error creating task:', error);
        showError('Failed to create task. Please try again.');
    }
}

// Update task in database
async function updateTask(taskId, updates) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) throw new Error('Failed to update task');
        
        // Update local task object
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        }
        
        renderAllTasks();
    } catch (error) {
        console.error('Error updating task:', error);
        showError('Failed to update task. Please try again.');
    }
}

// Move task to day
async function moveToDay(taskId, day) {
    await updateTask(taskId, {
        day: day,
        completed: 0
    });
}

// Recycle task back to pool
async function recycleTask(taskId) {
    await updateTask(taskId, {
        day: 'pool',
        completed: 0
    });
}

// Toggle task completion
async function toggleComplete(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const newCompleted = task.completed ? 0 : 1;
        const newDay = newCompleted ? 'completed' : task.day;
        
        await updateTask(taskId, {
            completed: newCompleted,
            day: newDay
        });
    }
}

// Delete task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete task');
        
        tasks = tasks.filter(t => t.id !== taskId);
        renderAllTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
        showError('Failed to delete task. Please try again.');
    }
}

// Render a single task
function renderTask(task) {
    const div = document.createElement('div');
    div.className = 'task-item' + (task.completed ? ' completed' : '');
    div.draggable = true;
    div.dataset.taskId = task.id;
    div.ondragstart = dragStart;
    div.ondragend = dragEnd;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'task-content';

    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    contentDiv.appendChild(textSpan);

    // Add checkbox if task is in a day
    if (task.day !== 'pool' && task.day !== 'completed') {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggleComplete(task.id);
        contentDiv.appendChild(checkbox);

        // Add recycle button
        const recycleBtn = document.createElement('button');
        recycleBtn.className = 'recycle-btn';
        recycleBtn.innerHTML = '♻️';
        recycleBtn.onclick = () => recycleTask(task.id);
        contentDiv.appendChild(recycleBtn);
    }

    div.appendChild(contentDiv);

    // Add day buttons if task is in pool
    if (task.day === 'pool') {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'day-buttons';

        const days = [
            { name: 'Mo', value: 'monday' },
            { name: 'Tu', value: 'tuesday' },
            { name: 'We', value: 'wednesday' },
            { name: 'Th', value: 'thursday' },
            { name: 'Fr', value: 'friday' },
            { name: 'Sa', value: 'saturday' },
            { name: 'Su', value: 'sunday' }
        ];

        days.forEach(day => {
            const btn = document.createElement('button');
            btn.className = 'day-btn';
            btn.textContent = day.name;
            btn.onclick = () => moveToDay(task.id, day.value);
            buttonsDiv.appendChild(btn);
        });

        div.appendChild(buttonsDiv);
    }

    // Add day buttons and delete button if task is completed
    if (task.day === 'completed') {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'day-buttons';

        const days = [
            { name: 'Mo', value: 'monday' },
            { name: 'Tu', value: 'tuesday' },
            { name: 'We', value: 'wednesday' },
            { name: 'Th', value: 'thursday' },
            { name: 'Fr', value: 'friday' },
            { name: 'Sa', value: 'saturday' },
            { name: 'Su', value: 'sunday' }
        ];

        days.forEach(day => {
            const btn = document.createElement('button');
            btn.className = 'day-btn';
            btn.textContent = day.name;
            btn.onclick = () => moveToDay(task.id, day.value);
            buttonsDiv.appendChild(btn);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(task.id);
        buttonsDiv.appendChild(deleteBtn);

        div.appendChild(buttonsDiv);
    }

    return div;
}

// Render all tasks
function renderAllTasks() {
    // Clear all containers
    document.getElementById('taskPool').innerHTML = '';
    document.getElementById('completedTasks').innerHTML = '';
    document.querySelectorAll('.day-tasks').forEach(el => el.innerHTML = '');

    // Render each task in its appropriate location
    tasks.forEach(task => {
        const taskElement = renderTask(task);
        
        if (task.day === 'pool') {
            document.getElementById('taskPool').appendChild(taskElement);
        } else if (task.day === 'completed') {
            document.getElementById('completedTasks').appendChild(taskElement);
        } else {
            const dayContainer = document.getElementById(`${task.day}-tasks`);
            if (dayContainer) {
                dayContainer.appendChild(taskElement);
            }
        }
    });
}

// Drag and drop functions
function dragStart(e) {
    draggedTaskId = parseInt(e.target.dataset.taskId);
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function allowDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.day-column');
    if (column) {
        column.classList.add('drag-over');
    }
}

function dragLeave(e) {
    const column = e.target.closest('.day-column');
    if (column) {
        column.classList.remove('drag-over');
    }
}

function drop(e) {
    e.preventDefault();
    const column = e.target.closest('.day-column');
    if (column) {
        column.classList.remove('drag-over');
        const day = column.dataset.day;
        if (draggedTaskId && day) {
            moveToDay(draggedTaskId, day);
        }
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Enter key to add task
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('newTaskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Load tasks on page load
    loadTasks();
});

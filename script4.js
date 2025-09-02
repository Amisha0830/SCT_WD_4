
        class TodoApp {
            constructor() {
                this.tasks = [];
                this.currentFilter = 'all';
                this.editingTaskId = null;
                
                this.loadTasks();
                this.initializeEventListeners();
                this.renderTasks();
                this.updateTasksCount();
            }

            initializeEventListeners() {
                // Add task button
                document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
                
                // Enter key to add task
                document.getElementById('taskInput').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });

                // Filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
                });

                // Clear completed button
                document.getElementById('clearCompletedBtn').addEventListener('click', () => this.clearCompleted());
            }

            generateId() {
                return Date.now() + Math.random().toString(36).substr(2, 9);
            }

            addTask() {
                const taskText = document.getElementById('taskInput').value.trim();
                const priority = document.getElementById('prioritySelect').value;
                const category = document.getElementById('categorySelect').value;
                const dueDate = document.getElementById('dueDateInput').value;
                const dueTime = document.getElementById('dueTimeInput').value;

                if (!taskText) {
                    alert('Please enter a task!');
                    return;
                }

                const task = {
                    id: this.generateId(),
                    text: taskText,
                    completed: false,
                    priority: priority,
                    category: category,
                    dueDate: dueDate || null,
                    dueTime: dueTime || null,
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(task);
                this.saveTasks();
                this.clearInputs();
                this.renderTasks();
                this.updateTasksCount();
            }

            clearInputs() {
                document.getElementById('taskInput').value = '';
                document.getElementById('dueDateInput').value = '';
                document.getElementById('dueTimeInput').value = '';
            }

            toggleTask(id) {
                const task = this.tasks.find(t => t.id === id);
                if (task) {
                    task.completed = !task.completed;
                    task.completedAt = task.completed ? new Date().toISOString() : null;
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTasksCount();
                }
            }

            deleteTask(id) {
                if (confirm('Are you sure you want to delete this task?')) {
                    this.tasks = this.tasks.filter(t => t.id !== id);
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTasksCount();
                }
            }

            startEdit(id) {
                this.editingTaskId = id;
                this.renderTasks();
            }

            cancelEdit() {
                this.editingTaskId = null;
                this.renderTasks();
            }

            saveEdit(id, newText) {
                const task = this.tasks.find(t => t.id === id);
                if (task && newText.trim()) {
                    task.text = newText.trim();
                    this.editingTaskId = null;
                    this.saveTasks();
                    this.renderTasks();
                }
            }

            setFilter(filter) {
                this.currentFilter = filter;
                
                // Update active filter button
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
                
                this.renderTasks();
                this.updateTasksCount();
            }

            getFilteredTasks() {
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                return this.tasks.filter(task => {
                    switch (this.currentFilter) {
                        case 'active':
                            return !task.completed;
                        case 'completed':
                            return task.completed;
                        case 'high':
                            return task.priority === 'high';
                        case 'overdue':
                            if (!task.dueDate || task.completed) return false;
                            const dueDate = new Date(task.dueDate);
                            return dueDate < today;
                        case 'today':
                            if (!task.dueDate) return false;
                            const taskDate = new Date(task.dueDate);
                            return taskDate.toDateString() === today.toDateString();
                        default:
                            return true;
                    }
                });
            }

            getTaskStatus(task) {
                if (task.completed) return '';
                
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    if (dueDate < today) return 'overdue';
                    if (dueDate.toDateString() === today.toDateString()) return 'due-today';
                }
                
                return '';
            }

            formatDateTime(date, time) {
                if (!date) return '';
                
                const dateObj = new Date(date);
                const dateStr = dateObj.toLocaleDateString();
                
                if (time) {
                    return `${dateStr} at ${time}`;
                }
                
                return dateStr;
            }

            clearCompleted() {
                const completedCount = this.tasks.filter(t => t.completed).length;
                if (completedCount === 0) {
                    alert('No completed tasks to clear!');
                    return;
                }

                if (confirm(`Delete ${completedCount} completed task(s)?`)) {
                    this.tasks = this.tasks.filter(t => !t.completed);
                    this.saveTasks();
                    this.renderTasks();
                    this.updateTasksCount();
                }
            }

            renderTasks() {
                const tasksList = document.getElementById('tasksList');
                const filteredTasks = this.getFilteredTasks();

                if (filteredTasks.length === 0) {
                    tasksList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📝</div>
                            <div>No tasks to show</div>
                        </div>
                    `;
                    return;
                }

                tasksList.innerHTML = filteredTasks.map(task => {
                    const statusClass = this.getTaskStatus(task);
                    const isEditing = this.editingTaskId === task.id;

                    return `
                        <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority ${statusClass}">
                            <div class="task-header">
                                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                                       onchange="todoApp.toggleTask('${task.id}')">
                                <div class="task-text ${task.completed ? 'completed' : ''}" id="task-text-${task.id}">
                                    ${task.text}
                                </div>
                                <div class="task-actions">
                                    <button class="task-btn edit-btn" onclick="todoApp.startEdit('${task.id}')" 
                                            ${task.completed ? 'disabled' : ''}>✏️ Edit</button>
                                    <button class="task-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')">🗑️ Delete</button>
                                </div>
                            </div>
                            
                            ${isEditing ? `
                                <div class="edit-form">
                                    <input type="text" class="edit-input" value="${task.text}" id="edit-input-${task.id}">
                                    <div class="edit-actions">
                                        <button class="task-btn save-btn" onclick="todoApp.saveEdit('${task.id}', document.getElementById('edit-input-${task.id}').value)">💾 Save</button>
                                        <button class="task-btn cancel-btn" onclick="todoApp.cancelEdit()">❌ Cancel</button>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="task-details">
                                <div class="task-detail">
                                    <span>Priority:</span>
                                    <span class="priority-${task.priority}">
                                        ${task.priority === 'high' ? '🔴 High' : task.priority === 'medium' ? '🟡 Medium' : '🟢 Low'}
                                    </span>
                                </div>
                                <div class="task-detail">
                                    <span>Category:</span>
                                    <span class="category-tag">${task.category}</span>
                                </div>
                                ${task.dueDate ? `
                                    <div class="task-detail">
                                        <span>Due:</span>
                                        <span>${this.formatDateTime(task.dueDate, task.dueTime)}</span>
                                    </div>
                                ` : ''}
                                <div class="task-detail">
                                    <span>Created:</span>
                                    <span>${new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            updateTasksCount() {
                const filteredTasks = this.getFilteredTasks();
                const total = filteredTasks.length;
                const completed = filteredTasks.filter(t => t.completed).length;
                const active = total - completed;

                let countText = '';
                if (this.currentFilter === 'all') {
                    countText = `${total} tasks (${active} active, ${completed} completed)`;
                } else {
                    countText = `${total} ${this.currentFilter} tasks`;
                }

                document.getElementById('tasksCount').textContent = countText;
            }

            saveTasks() {
                // In a real app, this would save to a server
                // For demo purposes, tasks reset on page reload
            }

            loadTasks() {
                // In a real app, this would load from a server
                // Starting with empty tasks array
                this.tasks = [];
            }
        }

        // Initialize the app
        let todoApp;
        document.addEventListener('DOMContentLoaded', () => {
            todoApp = new TodoApp();
        });
   
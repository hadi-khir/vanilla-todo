/**
 * Updates the current date and time in the designated element.
 */
function getCurrentDate() {

    let dateEl = document.querySelector('.current-date');
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = `${dd}/${mm}/${yyyy} - ${today.toLocaleTimeString()}`;
    dateEl.textContent = today; // Updates the text instead of appending
}

/**
 * Enables or disables the add button based on the validity of the user input.
 */
function onTodoInputChange() {

    // Grab the user input. 
    const todoInput = document.querySelector('.todo-input');
    if (notNullOrEmpty(todoInput.value)) {

        let addTodoBtn = document.querySelector('.input-btn');
        addTodoBtn.removeAttribute('disabled');
    } else {

        let addTodoBtn = document.querySelector('.input-btn');
        addTodoBtn.setAttribute('disabled', true);
    }
}

/**
 * Disables the add todo button.
 */
function disableAddTodoButton() {

    return document.querySelector('.input-btn').setAttribute('disabled', true);
}


/**
 * Creates a new todo item, adds it to local storage, and displays it in the UI.
 */
function createTodo() {

    // Grab the user input. 
    const newTodoInput = document.querySelector('.todo-input').value;
    if (!notNullOrEmpty(newTodoInput)) {
        alert('User todo input is invalid!');
        return;
    }

    let taskObj = {
        title: sanitize(newTodoInput.trim()),
        completed: false
    }

    addToStorage(taskObj);

    createHtmlElementForTask(taskObj);

    disableAddTodoButton();
}

/**
 * Creates an HTML element for a todo item and appends it to the list.
 * @param {Object} task - The task object containing title and completion status.
 */
function createHtmlElementForTask(task) {

    const title = task.title;
    const completed = task.completed;

    // Create the delete button

    let icon = document.createElement("i");
    icon.classList.add('fa-regular', 'fa-trash-can');
    let btnSpan = document.createElement("span");
    btnSpan.appendChild(icon);
    var deleteBtn = document.createElement('button');
    deleteBtn.appendChild(btnSpan);
    deleteBtn.classList.add('todo-item-delete');
    deleteBtn.setAttribute('onclick', 'deleteTodo(event)')

    // Create the title
    var todoTitle = document.createElement('span');
    todoTitle.appendChild(document.createTextNode(task.title));
    if (completed) {
        todoTitle.classList.add('list-item-completed');
    }
    todoTitle.classList.add('todo-item-title');

    // Create the input checkbox
    var todoCheckBox = document.createElement('input');
    todoCheckBox.setAttribute('type', 'checkbox');
    todoCheckBox.setAttribute('onclick', 'completeTodo(event)');
    if (completed) {
        todoCheckBox.setAttribute('checked', true);
    }
    todoCheckBox.classList.add('todo-item-checkbox');

    // Add the children to the list item
    var newTodoListItem = document.createElement('li');
    newTodoListItem.classList.add('list-item');
    newTodoListItem.appendChild(todoCheckBox);
    newTodoListItem.appendChild(todoTitle);
    newTodoListItem.appendChild(deleteBtn);

    // Add the new list item to the task list
    var todoList = document.querySelector('.todos-list');
    todoList.appendChild(newTodoListItem);

    // Reset the input
    document.querySelector('.todo-input').value = '';
}

/**
 * Adds a task to local storage and updates the task count.
 * @param {Object} task - The task object to add.
 */
function addToStorage(task) {

    let tasks;

    if (localStorage.getItem('tasks') === null) {
        tasks = [task];
    } else {
        tasks = JSON.parse(localStorage.getItem('tasks'));
        tasks.push(task);
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTotalCount(tasks.length);
}

/**
 * Deletes a todo item from local storage and the UI.
 * @param {Event} event - The click event triggered by the delete button.
 * @returns {boolean} False if the event is null or undefined.
 */
function deleteTodo(event) {

    if (event === null || event === undefined) {
        alert('Something went wrong, could not process request.');
        return false;
    }

    let selectedTodo = event.target;
    let parentEL = selectedTodo.parentNode;

    let deletedTaskValue = parentEL.querySelector('span').innerText;
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    const deletionIndex = tasks.findIndex(t => t.title === deletedTaskValue);
    if (deletionIndex > -1) {
        tasks.splice(deletionIndex, 1);
    } else {
        console.log('Unable to find deleted item')
    }

    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTotalCount(tasks.length);

    parentEL.remove();
}

/**
 * Marks a todo item as completed or uncompleted and updates local storage.
 * @param {Event} event - The click event triggered by the checkbox.
 * @returns {boolean} False if the event is null or undefined.
 */
function completeTodo(event) {
    if (event === null || event === undefined) {
        alert('Something went wrong, could not process request.');
        return false;
    }

    let checkbox = event.target;
    let parent = checkbox.parentNode;
    let todoItemText = parent.querySelector('span');

    // get the tasks
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks = tasks.map(t => {
        if (t.title === todoItemText.innerText) {
            t.completed = checkbox.checked;
        }
        return t;
    });

    // Save updated tasks to storage
    localStorage.setItem('tasks', JSON.stringify(tasks));

    if (checkbox.checked) {
        todoItemText.classList.add('list-item-completed');

        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        todoItemText.classList.remove('list-item-completed');
    }

    updateTotalCount(tasks.length);
}


/**
 * Removes all completed tasks from local storage and the UI.
 */
function removeCompletedTasks() {

    let tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks === null) {
        return;
    }

    let completedTasks = tasks.filter(t => t.completed === true);

    if (completedTasks.length < 1) {
        return;
    }

    let uncompletedTasks = tasks.filter(t => t.completed === false);

    // first we remove the completed tasks from the html. 
    let listItems = Array.from(document.querySelectorAll('.todos-list li'));

    completedTasks.forEach(t => {
        const deletedEl = listItems.filter(l => l.querySelector('span').innerText === t.title)[0];

        if (deletedEl !== null) {
            deletedEl.remove();
        } else {
            console.warn('Unable to find deleted task')
        }
    })

    // update storage with only the uncompleted tasks
    localStorage.setItem('tasks', JSON.stringify(uncompletedTasks));
}

/**
 * Filters and displays tasks based on the provided condition.
 * @param {Function} filterCondition - A function defining the filter criteria.
 */
function filterTasks(filterCondition) {

    removeSelectedFilterStyles();

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    document.querySelector('.todos-list').replaceChildren();

    const filteredTasks = tasks.filter(filterCondition).forEach(createHtmlElementForTask);
    updateTotalCount(filteredTasks.length);
}

/**
 * Displays only active (uncompleted) tasks.
 */
function getActiveTasks() {

    // change the filter button css
    let activeButton = document.querySelector('.filter-option-active').classList.add('filter-option-selected');

    filterTasks(t => t.completed != true);
}

/**
 * Displays only completed tasks.
 */
function getCompletedTasks() {

    // change the filter button css
    let completedButton = document.querySelector('.filter-option-completed').classList.add('filter-option-selected');

    filterTasks(t => t.completed === true);
}

/**
 * Displays all tasks, both completed and uncompleted.
 */
function getAllTasks() {

    // remove the selected filter style
    removeSelectedFilterStyles();

    // change the filter button css
    let allButton = document.querySelector('.filter-option-all');
    allButton.classList.add('filter-option-selected');

    // get the list of tasks from storage

    document.querySelector('.todos-list').replaceChildren();

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Build uncompleted tasks first
    tasks.filter(task => !task.completed).forEach(createHtmlElementForTask);

    // Then build completed tasks
    tasks.filter(task => task.completed).forEach(createHtmlElementForTask);

    updateTotalCount(tasks.length);
}

/**
 * Removes the selected style from the currently active filter option.
 */
function removeSelectedFilterStyles() {

    let selectedFilter = document.querySelector('.filter-option-selected');
    if (selectedFilter === null) {
        return;
    }

    selectedFilter.classList.remove('filter-option-selected');
}

/**
 * Checks if a given string is not null or empty.
 * @param {string} inputStr - The string to check.
 * @returns {boolean} True if the string is not null or empty, false otherwise.
 */
function notNullOrEmpty(inputStr) {

    const trimmedInput = inputStr.trim();
    if (trimmedInput !== null && trimmedInput !== '' && trimmedInput.length > 0) {
        return true;
    }

    return false;
}

/**
 * Sanitizes a string to prevent XSS attacks.
 * @param {string} string - The string to sanitize.
 * @returns {string} The sanitized string.
 */
function sanitize(string) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;',
    };
    const reg = /[&<>"'/]/ig;
    return string.replace(reg, (match) => (map[match]));
}

/**
 * Updates the task counter element with the current task count.
 * @param {number} total - The total number of tasks.
 */
function updateTotalCount(total) {

    let totalCount = document.querySelector('.total-count');
    totalCount.innerText = `Task Count: ${total}`;
}

getAllTasks();
window.setInterval(getCurrentDate, 1000);
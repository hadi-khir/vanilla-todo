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
 * Fetches the users tasks from the browsers localstorage and updates the total count text.
 * 
 * @returns any tasks stored in the browsers localstorage under the key 'tasks'.
 */
function fetchFromStorage() {

    let tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks === null) {
        return;
    }

    for (const task of tasks) {
        createHtmlElementForTask(task);
    }

    updateTotalCount(tasks.length);
}

/**
 * Creates a new HTML todo item, include the li parent node, along with the input, span and button child elements.
 * Additionally stores the task details in the browsers localstorage.
 * @returns a new @code{'li'} item to be added to the task list. 
 */
function createTodo() {

    // Grab the user input. 
    const newTodoInput = document.querySelector('.todo-input').value;
    if (!notNullOrEmpty(newTodoInput)) {
        alert('User todo input is invalid!');
        return;
    }

    let taskObj = {
        title: newTodoInput.trim(),
        completed: false
    }

    addToStorage(taskObj);

    createHtmlElementForTask(taskObj);
}

function createHtmlElementForTask(task) {

    const title = task.title;
    const completed = task.completed;

    // Create the delete button
    var deleteBtn = document.createElement('button');
    let icon = document.createElement("i");
    icon.classList.add('fa-regular', 'fa-trash-can');
    deleteBtn.appendChild(icon);
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
 * Removes an item from the todo list.
 * @param {HTMLEvent} event signaling the onclick function of the todo delete button.
 * @returns false if the event is null or undefined. Nothing otherwise.
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
 * Completes a todo item by applying a CSS class to the span element. 
 * @param {HTMLEvent} event actioning the checkbox click of a todo item. 
 * @returns false if the event is null, signaling an error. Nothing otherwise.
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
 * Remove tasks marked as completed from both the document and storage.
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

function getActiveTasks() {

    // remove the selected filter style
    removeSelectedFilterStyles();

    // change the filter button css
    let activeButton = document.querySelector('.filter-option-active');
    activeButton.classList.add('filter-option-selected');

    // get the list of tasks from storage
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks === null) {
        return;
    }

    const activeTasks = tasks.filter(t => t.completed === false);

    document.querySelector('.todos-list').replaceChildren();

    activeTasks.forEach(t => createHtmlElementForTask(t));
    updateTotalCount(activeTasks.length);
}

function getCompletedTasks() {

    // remove the selected filter style
    removeSelectedFilterStyles();

    // change the filter button css
    let completedButton = document.querySelector('.filter-option-completed');
    completedButton.classList.add('filter-option-selected');

    // get the list of tasks from storage
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks === null) {
        return;
    }

    const completedTasks = tasks.filter(t => t.completed === true);

    document.querySelector('.todos-list').replaceChildren();

    completedTasks.forEach(t => createHtmlElementForTask(t));
    updateTotalCount(completedTasks.length);
}

function getAllTasks() {

    // remove the selected filter style
    removeSelectedFilterStyles();

    // change the filter button css
    let allButton = document.querySelector('.filter-option-all');
    allButton.classList.add('filter-option-selected');

    // get the list of tasks from storage
    const tasks = JSON.parse(localStorage.getItem('tasks'));

    if (tasks === null) {
        return;
    }

    document.querySelector('.todos-list').replaceChildren();

    tasks.forEach(t => createHtmlElementForTask(t));
    updateTotalCount(tasks.length);
}

function removeSelectedFilterStyles() {

    let selectedFilter = document.querySelector('.filter-option-selected');
    if (selectedFilter === null) {
        return;
    }

    selectedFilter.classList.remove('filter-option-selected');
}

/**
 * Checks if a given input is null or empty. 
 * 
 * @param {string} inputStr containing the user input for the ToDo item. 
 * @returns {boolean} true if the trimmed input is null or empty, false otherwise. 
 */
function notNullOrEmpty(inputStr) {

    const trimmedInput = inputStr.trim();
    if (trimmedInput !== null && trimmedInput !== '' && trimmedInput.length > 0) {
        return true;
    }

    return false;
}

/**
 * Updates the task counter element based on the number of tasks for the user. 
 * @param {number} total amount of tasks.
 */
function updateTotalCount(total) {

    let totalCount = document.querySelector('.total-count');
    totalCount.innerText = `Task Count: ${total}`;
}

fetchFromStorage();
window.setInterval(getCurrentDate, 1000);
getAllTasks();
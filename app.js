function getCurrentDate() {

    let dateEl = document.querySelector('.current-date');
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = dd + '/' + mm + '/' + yyyy;
    dateEl.appendChild(document.createTextNode(today))
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

    addToStorage(newTodoInput);

    createHtmlElementForTask(newTodoInput);
}

function createHtmlElementForTask(task) {

    // Create the delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.appendChild(document.createTextNode('Delete'));
    deleteBtn.classList.add('todo-item-delete');
    deleteBtn.setAttribute('onclick', 'deleteTodo(event)')

    // Create the title
    var todoTitle = document.createElement('span');
    todoTitle.appendChild(document.createTextNode(task));
    todoTitle.classList.add('todo-item-title');

    // Create the input checkbox
    var todoCheckBox = document.createElement('input');
    todoCheckBox.setAttribute('type', 'checkbox');
    todoCheckBox.setAttribute('onclick', 'completeTodo(event)');
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
    const deletionIndex = tasks.indexOf(deletedTaskValue);
    if (deletionIndex > -1) {
        tasks.splice(deletionIndex, 1);
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

    if (checkbox.checked === true) {

        todoItemText.classList.add('list-item-completed');
    } else {

        todoItemText.classList.remove('list-item-completed');
    }
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
getCurrentDate();
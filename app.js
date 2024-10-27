/**
 * Creates a new HTML todo item, include the li parent node, along with the input, span and button child elements.
 * @param {HTMLEvent} event signalling the entering of a todo item via return key click.
 * @returns a new @code{'li'} item to be added to the task list. 
 */
function createTodo(event) {

    if (event !== null && event !== undefined) {
        
        if (event.key !== "Enter") {
            return false;
        }
    } 

    // Grab the user input. 
    const newTodoInput = document.querySelector('.todo-input').value;
    if (!notNullOrEmpty(newTodoInput)) {
        alert('User todo input is invalid!');
        return;
    }

    // Create the delete button
    var deleteBtn = document.createElement('button');
    deleteBtn.appendChild(document.createTextNode('Delete'));
    deleteBtn.classList.add('todo-item-delete');
    deleteBtn.setAttribute('onclick', 'deleteTodo(event)')
    
    // Create the title
    var todoTitle = document.createElement('span');
    todoTitle.appendChild(document.createTextNode(newTodoInput));
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

    if (event) {

        event.stopPropagation();
        event.preventDefault();
    }
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
function createTodo() {
    
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
    
    // Create the title
    var todoTitle = document.createElement('span');
    todoTitle.appendChild(document.createTextNode(newTodoInput));
    todoTitle.classList.add('todo-item-title');

    // Create the input checkbox
    var todoCheckBox = document.createElement('input');
    todoCheckBox.setAttribute('type', 'checkbox');
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
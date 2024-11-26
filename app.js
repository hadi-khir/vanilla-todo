/**
 * Initializes the application by setting up groups, fetching tasks, and displaying the current date.
 */
function initialize() {


    let groups = JSON.parse(localStorage.getItem('groups')) || [];

    if (groups.length < 1) {
        groups = [
            {
                id: 'reminders',
                selected: true
            }
        ]
        localStorage.setItem('groups', JSON.stringify(groups));
    }

    const selectedGroup = groups.filter(g => g.selected)[0];
    groups.forEach(createHtmlElementForGroup);
    fetchGroupItems(selectedGroup.id);

    getCurrentDate();
}

/**
 * Displays the modal for creating a new group.
 */
function openGroupCreationModal() {

    document.querySelector('.add-group-modal').style.display = 'block';
}

/**
 * Hides the modal for creating a new group.
 */
function closeGroupCreationModal() {

    document.querySelector('.add-group-modal').style.display = 'none';
}

/**
 * Adds a new todo group, updates local storage, and refreshes the UI.
 */
function addTodoGroup() {

    let createGroupInput = document.querySelector('.add-group-modal-input');
    const groupText = createGroupInput.value;
    if (!notNullOrEmpty(groupText)) {
        alert('Group input is invalid!');
        return;
    }

    let group = {
        id: titleToId(sanitize(groupText.trim())),
        selected: false,
    }

    let groups;

    if (JSON.parse(localStorage.getItem('groups')) === null) {
        groups = [group];
    } else {
        groups = JSON.parse(localStorage.getItem('groups'));
        groups.push(group);
    }

    localStorage.setItem('groups', JSON.stringify(groups));
    createHtmlElementForGroup(group);

    createGroupInput.value = '';

    closeGroupCreationModal();

    fetchGroupItems(group.id);
}

/**
 * Fetches and displays the items for a specific group.
 * @param {string} groupId - The ID of the group to fetch items for.
 */
function fetchGroupItems(groupId) {

    let prevSelected = document.querySelector('.todo-group-btn.selected');
    if (prevSelected) {
        prevSelected.classList.remove('selected');
    }

    document.getElementById(groupId).classList.add('selected');
    getAllTasks(groupId);
    saveSelectedGroup(groupId);
}

/**
 * Saves the selected group in local storage and updates its state.
 * @param {string} groupId - The ID of the group to set as selected.
 */
function saveSelectedGroup(currentGroup) {
    // Retrieve the groups from localStorage
    let groups = JSON.parse(localStorage.getItem('groups')) || []; // Default to empty array if null
    console.log('Initial groups:', groups);

    // Update the selected state
    groups = groups.map(group => {
        console.log('Processing group:', group);

        // Ensure the group is valid and has an id
        if (!group || typeof group.id === 'undefined') {
            console.error('Invalid group:', group);
            return group; // Skip processing invalid group
        }

        // Create a new object with updated selected state
        return {
            ...group, // Keep existing properties
            selected: group.id === currentGroup, // Update selected state
        };
    });

    // Save the updated groups back to localStorage
    localStorage.setItem('groups', JSON.stringify(groups));
    console.log('Updated groups:', groups);
}

/**
 * Converts an ID to a title by capitalizing words and replacing hyphens with spaces.
 * @param {string} id - The ID to convert.
 * @returns {string} The converted title.
 */
function idToTitle(id) {

    return id.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Converts a title to an ID by lowercasing words and replacing spaces with hyphens.
 * @param {string} title - The title to convert.
 * @returns {string} The converted ID.
 */
function titleToId(title) {

    return title.split(' ')
        .map(word => word.toLowerCase())
        .join('-');
}

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
 * Handles input changes in the modal and enables/disables the add group button.
 */
function onModalInputChange() {

    const modalInput = document.querySelector('.add-group-modal-input');
    if (notNullOrEmpty(modalInput.value)) {

        let addGroupBtn = document.querySelector('.modal-group-btn');
        addGroupBtn.removeAttribute('disabled');
    } else {
        let addGroupBtn = document.querySelector('.modal-group-btn');
        addGroupBtn.setAttribute('disabled', true);
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

    // Grab the selected group
    const selectedGroup = document.querySelector('.todo-group-btn.selected').id;

    let taskObj = {
        title: sanitize(newTodoInput.trim()),
        completed: false,
        group: sanitize(selectedGroup)
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
 * Creates an HTML element for a group button and appends it to the group list.
 * @param {Object} group - The group object containing ID and selection status.
 */
function createHtmlElementForGroup(group) {

    let groupBtn = document.createElement('button');
    groupBtn.classList.add('todo-group-btn');
    if (group.selected) {
        groupBtn.classList.add('selected');
    }

    groupBtn.id = group.id;
    groupBtn.setAttribute('onclick', 'fetchGroupItems(this.id)');

    groupBtn.innerText = idToTitle(group.id)

    const childBtn = document.querySelector('.add-todo-group-btn');
    const parent = childBtn.parentNode;
    parent.insertBefore(groupBtn, childBtn);
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

function deleteGroup() {

    let groups = JSON.parse(localStorage.getItem('groups'));
    let tasks = JSON.parse(localStorage.getItem('tasks'));

    const selectedGroup = document.querySelector('.todo-group-btn.selected');
    tasks = tasks.filter(task => task.group !== selectedGroup.id);
    groups = groups.filter(group => group.id !== selectedGroup.id);

    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('groups', JSON.stringify(groups));

    document.querySelectorAll('.todo-group-btn').forEach(g => g.remove());
    initialize();
}

/**
 * Filters and displays tasks based on the provided condition.
 * @param {Function} filterCondition - A function defining the filter criteria.
 */
function filterTasks(filterCondition) {

    removeSelectedFilterStyles();

    const selectedGroup = document.querySelector('.todo-group-btn.selected').id;

    let tasks = JSON.parse(localStorage.getItem('tasks')).filter(t => t.group === selectedGroup) || [];

    document.querySelector('.todos-list').replaceChildren();

    const filteredTasks = tasks.filter(filterCondition).map(createHtmlElementForTask);
    updateTotalCount(filteredTasks ? filteredTasks.length : 0);
}

/**
 * Displays only active (uncompleted) tasks.
 */
function getActiveTasks() {

    filterTasks(t => t.completed != true);

    // change the filter button css
    document.querySelector('.filter-option-active').classList.add('filter-option-selected');
}

/**
 * Displays only completed tasks.
 */
function getCompletedTasks() {

    filterTasks(t => t.completed === true);

    // change the filter button css
    document.querySelector('.filter-option-completed').classList.add('filter-option-selected');
}

/**
 * Displays all tasks, both completed and uncompleted.
 */
function getAllTasks(groupId) {


    if (!groupId) {
        groupId = document.querySelector('.todo-group-btn.selected').id;
    }

    // remove the selected filter style
    removeSelectedFilterStyles();

    // change the filter button css
    document.querySelector('.filter-option-all').classList.add('filter-option-selected');

    // get the list of tasks from storage
    document.querySelector('.todos-list').replaceChildren();

    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const groupTasks = tasks.filter(t => t.group === groupId);

    // Build uncompleted tasks first
    groupTasks.filter(task => !task.completed).forEach(createHtmlElementForTask);

    // Then build completed tasks
    groupTasks.filter(task => task.completed).forEach(createHtmlElementForTask);

    updateTotalCount(groupTasks.length);
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
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
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

initialize();
window.setInterval(getCurrentDate, 1000);

window.onclick = function (event) {
    const modal = document.querySelector('.add-group-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
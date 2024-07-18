let HIDDENEDITFORM = 0
document.addEventListener('DOMContentLoaded', function (){
    const tasksTable = document.getElementById('tasks-table');
    const taskForm = document.getElementById('add-task-form');
    const container = document.getElementById("main-container");
    const editTaskForm = document.getElementById("edit-task-form");

    httpclient = cockpit.http({
        "address": "localhost",
        "port": 5000,
    });

    // Test API Connection
    httpclient.get("/test").then((response) => {
        msg = JSON.parse(response);
        console.log(msg);
    }).catch((error) => {
        console.error(JSON.stringify(error));
        const errorEl = document.createElement("div");
        errorEl.id = "error-message"
        errorEl.innerHTML = `<p>Could not load tasks list from API - [ Problem: ${error['problem']}, Message: ${error['message']} ]</p>`;
        container.prepend(errorEl);

    });
    //Task
    taskForm.addEventListener('submit', function(event) {
        const task = {
            owner: document.getElementById("owner").value,
            title: document.getElementById("t-title").value,
            description: document.getElementById("description").value,
            status: 0

        };
        addTask(task);
        taskForm.reset();
        console.log(task)
     });

     editTaskForm.addEventListener('submit', function(event) {
        const editedTask = {
            id: parseInt(document.getElementById("task-id-edit").innerText),
            owner: document.getElementById("edit-owner").value,
            title: document.getElementById("edit-title").value,
            description: document.getElementById("edit-description").value,
            status: document.getElementById("edit-select-status").value
        }
        updateTask(editedTask);

     });

    // API Edit Task (GET)
    window.editTask = function (id, task) {
        httpclient.request({
            path: `/update/${id}`,
            method: "GET",
            body: ""}).then((response) => {
                let task_details = JSON.parse(response);
                renderEditForm(task_details);
            });
    }

    // API Update Task (PUT)
     function updateTask(task) {
        console.log(task);
        httpclient.request({
            path: `/update/${task['id']}`,
            method: "PUT",
            body: JSON.stringify(task)}).then((response) => {
                console.log(JSON.parse(response));
                refreshTasks();
            }).catch((error) => {
                console.error("Error updating task:", error);
            });
     }

    // API Add New Task
    function addTask(task) {
        httpclient.request({
            path: "/create",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task)}).then((response) => {
                console.log(response.status)
                let message = JSON.parse(response);
                console.log(message);
                refreshTasks();
            }).catch((error) => {
                console.error("Error adding task:", error);
            });
    }

    // API Load Tasks
    function loadTasks () {
        httpclient.request({
            path: "/tasks",
            method: "GET",
            body: ""}).then((response) => {
                try {
                    let tasks = JSON.parse(response);
                    renderTasks(tasks);
                } catch (error) {
                    console.error('Error parsing tasks:', error);
                    return;
                }
            });
    }

    function renderTasks(tasks) {
        for (const key in tasks) {
            // Button Expand Description
            const infoBtn = document.createElement('button');
            infoBtn.innerText = " ";
            infoBtn.classList.add("task-desc-more-btn");
            infoBtn.setAttribute('onclick', 'showMore(this)');

            // Button Delete Task
            const deleteBtn = document.createElement("button");
            deleteBtn.innerText = " ";
            deleteBtn.classList.add("actions");
            deleteBtn.id = "delete-btn";
            deleteBtn.setAttribute('title', "Delete Task");
            deleteBtn.setAttribute('onclick', `deleteTask(${key}, this)`);

            // Button Edit Task
            const editBtn = document.createElement("button");
            editBtn.innerText = " ";
            editBtn.classList.add("actions");
            editBtn.id = "edit-btn";
            editBtn.setAttribute('title', "Edit Task");
            editBtn.setAttribute('onclick', `editTask(${key}, this)`);

            // Task ID
            const tdTaskId = document.createElement('td');
            tdTaskId.innerText = key
            tdTaskId.id = "task-id";

            // Task Owner
            const tdTaskOwner = document.createElement('td');
            tdTaskOwner.innerText = tasks[key]['owner']

            // Task Title
            const tdTaskTitle = document.createElement('td');
            tdTaskTitle.innerText = tasks[key]['title']

            // Task Description
            const tdTaskDesc = document.createElement('td');
            tdTaskDesc.classList.add("task-desc-short");
            tdTaskDesc.appendChild(infoBtn);
            tdTaskDesc.appendChild(document.createTextNode(tasks[key]['description']));

            // Task Status
            const tr = document.createElement('tr');
            const tdTaskStatus = document.createElement('td');
            tdTaskStatus.classList.add("task-status");
            switch (tasks[key]['status']) {
                case 0:
                    tr.classList.add("task-pending");
                    tdTaskStatus.appendChild(document.createTextNode("Pending"));
                    break;
                case 1:
                    tr.classList.add("task-completed");
                    tdTaskStatus.appendChild(document.createTextNode("Completed"));
                    break;
                case 2:
                    tr.classList.add("task-canceled");
                    tdTaskStatus.appendChild(document.createTextNode("Canceled"));
                    break;
            }


            // Task Actions
            const tdTaskActions = document.createElement('td');
            tdTaskActions.appendChild(deleteBtn);
            tdTaskActions.appendChild(editBtn);

            tr.append(tdTaskId, tdTaskOwner, tdTaskTitle, tdTaskDesc, tdTaskStatus, tdTaskActions);
            tasksTable.appendChild(tr) 
        }
    }

    // API Delete Task
    window.deleteTask = function (id, task) {
        httpclient.request({
            path: `/delete/${id}`,
            method: "DELETE",
            body: ""}).then((response) => {
                let message = JSON.parse(response);
                console.log(message);
                refreshTasks();
            });
    }

    // Edit Task Form
    function renderEditForm(task_details) {
        let editID = document.getElementById("task-id-edit");
        let ownerField = document.getElementById("edit-owner");
        let titleField = document.getElementById("edit-title");
        let descField = document.getElementById("edit-description");
        let statusOpts = document.getElementById("edit-select-status");

        editID.innerText = task_details['id'];
        ownerField.setAttribute('value', `${task_details['owner']}`);
        titleField.setAttribute('value', `${task_details['title']}`);
        descField.setAttribute('value', `${task_details['description']}`)

        
        let currentStat = document.createElement("option");
        let stat2 = document.createElement("option");
        let stat3 = document.createElement("option");
        switch (task_details['status']) {
            case 0:
                currentStat.innerText = "Pending";
                stat2.innerText = "Completed";
                stat3.innerText = "Canceled";
                break;
            case 1:
                currentStat.innerText = "Completed";
                stat2.innerText = "Pending";
                stat3.innerText = "Canceled";
                break;
            case 2:
                currentStat.innerText = "Canceled";
                stat2.innerText = "Pending";
                stat3.innerText = "Completed";
                break;
        }

        if (statusOpts.childElementCount === 3) {
            statusOpts.innerHTML = ""
        }

        statusOpts.append(currentStat, stat2, stat3);

        if (HIDDENEDITFORM === 0) {
            hideEditForm();
            HIDDENEDITFORM = 1;
        }


    }

    window.refreshTasks = function () {
        window.location.reload();
    }

    loadTasks();
});

function showForm(button) {
    let taskHeader = document.getElementById('header');
    taskHeader.classList.toggle('header-visible');
    taskHeader.classList.toggle('header-hidden');

    let taskForm = document.getElementById('add-task-form');
    taskForm.classList.toggle('form-visible');
    taskForm.classList.toggle('form-hidden');

    if (taskForm.classList.contains("form-visible")) {
        button.style.backgroundImage="url(static/img/close-30.png)"
    } else {
        button.style.backgroundImage="url(static/img/add-30.png)"
    }
}

function showMore(button) {

    var tdElement = button.parentElement;
    tdElement.classList.toggle('task-desc-short');
    tdElement.classList.toggle('task-desc-long');
    if (tdElement.classList.contains('task-desc-long')) {
        button.style.backgroundImage="url(static/img/collapse-32.png)"
    } else {
        button.style.backgroundImage="url(static/img/expand-32.png)"
    }
}

function hideEditForm() {
    HIDDENEDITFORM = 0;
    let taskHeader = document.getElementById('header');
    taskHeader.classList.toggle('header-visible');
    taskHeader.classList.toggle('header-hidden');
    let editForm = document.getElementById("edit-task-form");
    editForm.classList.toggle('form-visible');
    editForm.classList.toggle('form-hidden');
}

import $ from '../vendor/jquery-3.2.1.min';

function todoFunc() {

    // Initializing tasks variable and loading the list of tasks
    var tasks;

    todoLoadList();

    // Function that generates the list of tasks
    function todoLoadList() {
        chrome.storage.sync.get('todos', function (taskStorage) {
            var tasks = taskStorage.todos;
            $('#list').empty();
            if (tasks === undefined || tasks.length <= 0) {
                noTodo();
            } else {
                for (let i = 0; i < tasks.length; i++) {
                    if (tasks[i].status === 'tbd') {
                        $("#list").append(
                            "<li><input name='checkbox'class='listItem' id='" + tasks[i].task + "' type='checkbox'><span>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button>"
                        );
                    } else {
                        $("#list").append(
                            "<li><input name='checkbox' class='listItem' id='" + tasks[i].task + "' type='checkbox' checked><span class='itemDone'>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button></li>"
                        );
                    }
                }
            }
        });
    }

    // Listen when checkbox is tick and marks task as done or to be done
    $(document).on('change', 'input[name="checkbox"]', function () {
        var input = $(this).next('span');
        var taskID = this.id;
        if (this.checked) {
            $(input).toggleClass('itemDone');
            chrome.storage.sync.get('todos', function (taskStorage) {
                tasks = taskStorage.todos;
                for (var i = 0; i < tasks.length; i++) {
                    if (taskID == tasks[i].task) {
                        tasks[i].status = 'done';
                    }
                }
                chrome.storage.sync.set({
                    todos: tasks
                });
                todoLoadList();
            });
        } else {
            $(input).toggleClass('itemDone');
            chrome.storage.sync.get('todos', function (taskStorage) {
                tasks = taskStorage.todos;
                for (var i = 0; i < tasks.length; i++) {
                    if (taskID == tasks[i].task) {
                        tasks[i].status = 'tbd';
                    }
                }
                todoLoadList();
                chrome.storage.sync.set({
                    todos: tasks
                });
            });
        }
    });

    // Listens for the input field on the task and when Enter is pressed, it adds it to the list
    $("#inputTodo").on("keyup", function (e) {
        var newTodo = $("#inputTodo").val();
        if (e.which == 13 && newTodo.length != 0) {
            chrome.storage.sync.get({todos: []}, function (taskStorage) {
                tasks = taskStorage.todos;
                console.log(tasks);
                tasks.push({
                    'task': newTodo,
                    'status': 'tbd'
                });
                $("#noTodoImg").remove();
                $("#noTodoText").remove();
                $("#inputTodo").val('');
                chrome.storage.sync.set({
                    todos: tasks
                });
                todoLoadList();
            });
        }
    });
// When Delete button is clicked looks for the task in the list and removes it
    $("#list").on("click", 'button', function () {
        var itemToDelete = $(this).prev().prev().attr('id');
        chrome.storage.sync.get('todos', function (taskStorage) {
            tasks = taskStorage.todos;
            for (let i = 0; i < tasks.length; i++) {
                if (tasks[i].task == itemToDelete) {
                    tasks.splice(i, 1);
                }
            }
            chrome.storage.sync.set({
                todos: tasks
            });
            todoLoadList();
        });
    });
    // When there is no tasks, display image and some text
    function noTodo() {
        $('#todoList').append('<img src="../temp/images/smilyFace.png" id="noTodoImg" alt="smilyFace"> <p id="noTodoText">Woohoo, nothing to do!</p>');
    }

}

export default todoFunc;

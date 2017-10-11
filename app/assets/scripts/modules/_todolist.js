import $ from '../vendor/jquery-3.2.1.min';

function todoFunc() {

//creating example object list
/* var tasks = [
  {'task': 'ehasd', 'status': 'tbd'},
  {'task': 'asd',  'status': 'done'}
];
 */

chrome.storage.sync.set({task: 'nasdd13f', status: 'tbd'}, function() {
  // Notify that we saved.
  console.log('Settings saved');
});


var storage;

chrome.storage.sync.get(null, function(taskStorage) {
  if (!chrome.runtime.error) {
    storage = taskStorage;
  }
});

console.log(storage);

todoLoadList();

//generate list of tasks and add them to the list
function todoLoadList() {
  $('#list').empty();  
  if (tasks.length <= 0) {
    noTodo();
  } else {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].status === 'tbd') {
        $("#list").append(
          "<li><input name='checkbox'class='listItem' id='" + tasks[i].task + "' type='checkbox'><span>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button><button class='focusBtnTodo'>Main focus</button></li>"
        );
      } else {
        $("#list").append(
          "<li><input name='checkbox' class='listItem' id='" + tasks[i].task + "' type='checkbox' checked><span class='itemDone'>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button></li>"
        );
      }
    } 
  }
}
//detecting a task done
var numOfTodos = tasks.length;
$(document).on('change', 'input[name="checkbox"]', function(){
  var input = $(this).next('span');
  var taskID = this.id;

  if (this.checked) {
      numOfTodos--;
      $(input).toggleClass('itemDone');
      for (var i = 0; i < tasks.length; i++) {
        if (taskID == tasks[i].task) {
          tasks[i].status = 'done';
        }
      }
      
  } else {
      numOfTodos++;
      $(input).toggleClass('itemDone');
      for (var i = 0; i < tasks.length; i++) {
        if (taskID == tasks[i].task) {
          tasks[i].status = 'tbd';
        }
      }
  }
  todoLoadList();
});

//function to add new todos
$("#inputTodo").on("keyup", function(e) {
  var newTodo = $("#inputTodo").val();
  if (e.which == 13 && newTodo.length != 0) {
      chrome.storage.sync.set({task: newTodo, status: 'tbd'}, function() {
      // Notify that we saved.
      message('Settings saved');
    });
      tasks.push();
      $("#noTodoImg").remove();
      $("#noTodoText").remove();
      todoLoadList();
      $("#inputTodo").val('');
  }
});

$( "#list" ).on( "click", 'button', function() {
  var itemToDelete = $(this).prev().prev().attr('id');
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].task == itemToDelete) {
      tasks.splice(i, 1);
      todoLoadList();
    }
  }
});
//If there is no todo show an image
function noTodo() {
  $('#todoList').append('<img src="../temp/images/smilyFace.png" id="noTodoImg" alt="smilyFace"> <p id="noTodoText">Woohoo, nothing to do!</p>');
}
}

export default todoFunc;

import $ from '../vendor/jquery-3.2.1.min';

function todoFunc() {

//creating example object list
var tasks = [
  {'task': 'ehasd', 'status': 'tbd'},
  {'task': 'asd',  'status': 'done'}
];

todoLoadList();
todoLoadTitle(tasks.length);

//load the title updating the number of existing tasks
function todoLoadTitle() {
  console.log(tasks);
  var numOfTasks = 0;
  if (tasks.length > 0) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].status == 'tbd') {
        numOfTasks++;
      }
    }
    $('#todoHeader').html('<p id="todoTitle">' + numOfTasks +' to do</p>');
  } else {
    noTodo();
    $('#todoHeader').html('<p id="todoTitle"> 0 to do</p>');
  }
}

//generate list of tasks and add them to the list
function todoLoadList() {
  $('#list').empty();  
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].status === 'tbd') {
      $("#list").append(
        "<li><input name='checkbox'class='listItem' id='" + tasks[i].task + "' type='checkbox'><span>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button></li>"
      );
    } else {
      $("#list").append(
        "<li><input name='checkbox' class='listItem' id='" + tasks[i].task + "' type='checkbox' checked><span class='itemDone'>" + tasks[i].task + "</span><button class='deleteBtnTodo'>Delete</button></li>"
      );
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
      todoLoadTitle();
  } else {
      numOfTodos++;
      $(input).toggleClass('itemDone');
      for (var i = 0; i < tasks.length; i++) {
        if (taskID == tasks[i].task) {
          tasks[i].status = 'tbd';
        }
      }
      todoLoadTitle();
  }
});

//function to add new todos
$("#inputTodo").on("keyup", function(e) {
  var newTodo = $("#inputTodo").val();
  if (e.which == 13 && newTodo.length != 0) {
      tasks.push({task: newTodo, status: 'tbd'});
      $("#noTodoImg").remove();
      $("#noTodoText").remove();
      todoLoadTitle();
      todoLoadList();
      $("#inputTodo").val('');
  }
});

$( "#list" ).on( "click", 'button', function() {
  var itemToDelete = $(this).prev().prev().attr('id');
  for (var i = 0; i < tasks.length; i++) {
    if (tasks[i].task == itemToDelete) {
      tasks.splice(i, 1);
      todoLoadTitle();
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

let todoList=JSON.parse(localStorage.getItem('todoList')) || [];

let currentFilter = 'all';
let searchQuery = '';

renderTodoList();

function renderTodoList(){
  
  todoList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const incompleteCount=todoList.filter(todo => !todo.completed).length;
  const counterElement=document.querySelector('.js-todo-counter');
  if (counterElement) {
    counterElement.innerHTML = `${incompleteCount} task${incompleteCount === 1 ? '' : 's'} remaining`;
  } 

const today = new Date();
const todayStr =`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

   const visibleTodos = todoList.filter (todo=> {
    const { name, completed } = todo;
    if(currentFilter === 'active' && completed) return false;
    if(currentFilter === 'completed' && !completed) return false;
    if (searchQuery !== '' && !name.toLowerCase().includes(searchQuery.toLowerCase())) return false; return true;
    });
  
   let todoListHTML='';
    if (visibleTodos.length === 0) {
    todoListHTML = `<div class="empty-state">Your todo list is empty!</div>`;
  }else{
     visibleTodos.forEach(todo => {
    const {name, dueDate, completed,id} = todo;
    const isChecked=completed ? 'checked':'';
    const isCompleted=completed ? 'completed':'';
    const isOverdue = !completed && dueDate < todayStr ? 'overdue' : '';
    todoListHTML +=
    `
    <div class="todo-item" data-id="${todo.id}">
    <input type="checkbox" class="checkbox" data-id="${todo.id}" ${isChecked}>
    <div class="todo-name ${isCompleted}" id="todo-text-${todo.id}">${name}</div>
    <div class="todo-date ${isOverdue}">${dueDate}</div>
    <button class="edit-todo-button js-edit-button" ${completed ? 'disabled':''}>Edit</button>
    <button class="delete-todo-button js-delete-button">Delete</button>
    </div>
    `;
    });
  }
  
 localStorage.setItem('todoList', JSON.stringify(todoList));
  const listContainer = document.querySelector('.js-todo-list');
  if (listContainer) {
    listContainer.innerHTML = todoListHTML;
  }
}

const searchInput = document.querySelector('.js-search-task');
if (searchInput) {
  searchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value; 
    renderTodoList();                 
  });
}
const listContainer = document.querySelector('.js-todo-list');
if (listContainer) {
  listContainer.addEventListener('click', (e) => {
    if (e.target.matches('.checkbox')) {
      toggleComplete(e.target.dataset.id);
    }
  if (e.target.matches('.js-delete-button')) {
      const todoItemRow = e.target.closest('.todo-item');
      if (todoItemRow) {
        const id = todoItemRow.dataset.id;
        todoList = todoList.filter(t => t.id !== id);
        renderTodoList();
      }
    }
    if(e.target.matches('.js-edit-button')){
      if(e.target.disabled)return;
      const todoItemRow=e.target.closest('.todo-item');
      const nameElement=todoItemRow.querySelector('.todo-name');
      startEditing(nameElement);
    }
  });
}
document.querySelector('.js-add-button').addEventListener('click',addTodo)

  function pressEnter (event){
  if(event.key=== 'Enter'){
    addTodo()
  }
}
const nameInput = document.querySelector('.js-name-input');
if (nameInput) nameInput.addEventListener('keydown', pressEnter);

const dateInput = document.querySelector('.js-duedate-input');
if (dateInput) dateInput.addEventListener('keydown', pressEnter);

const clearButton=document.querySelector('.js-clear-button');
if(clearButton){
  clearButton.addEventListener('click', ()=> {
    const confiirmClear = confirm('Are you sure you want to delete All tasks?');
    if(confiirmClear){
    todoList=[];
  renderTodoList();
    }
});
}
const clearCompletedButton = document.querySelector('.js-clear-completed');
if(clearCompletedButton){
  clearCompletedButton.addEventListener('click',() =>{
    todoList = todoList.filter(todo => !todo.completed);
    renderTodoList();
  });
}
function addTodo(){
  const inputElement=document.querySelector('.js-name-input');
  const dateInputElement=document.querySelector('.js-duedate-input')
 
  if (!inputElement||!dateInputElement) return;
  const dueDate=dateInputElement.value;
  const name=inputElement.value.trim();

  if (!name || !dueDate) {
    alert('Please enter both a task name and a due date.');
    return;}

  todoList.push({id:typeof crypto !== 'undefined' ? crypto.randomUUID() : Date.now().toString(),name,dueDate,completed: false});
 
   inputElement.value='';
   dateInputElement.value = '';
   renderTodoList();
}
function startEditing(nameElement){
  const todoItem = nameElement.closest('.todo-item');
  const id = todoItem.dataset.id;
  const todo=todoList.find(t=>t.id===id);
  if(!todo)return;

  const dataElement = todoItem.querySelector('.todo-date');
  const nameInput=document.createElement('input');
  nameInput.type='text';
  nameInput.className='edit-input';
  nameInput.value=todo.name;

  const dateInput = document.createElement('input')
  dateInput.type = 'date';
  dateInput.className = 'edit-input date-edit-input';
  dateInput.value = todo.dueDate;
  nameElement.replaceWith(nameInput);
  if(dataElement)dataElement.replaceWith(dateInput);
  nameInput.focus();
  nameInput.select();
  let isSaving = false;


  function saveEdit(){
    if(isSaving)return;
    

    const newName = nameInput.value.trim();
    const newDate = dateInput.value;

    if(!newName){
      nameInput.style.borderColor='#dc3545'
      nameInput.placeholder='Task name cannot be empty!';
      nameInput.focus();
      return;
    }
    isSaving=true;

    todo.name=newName||todo.name;
    todo.dueDate = newDate || todo.dueDate;

    renderTodoList();
  }
  nameInput.addEventListener('blur',()=>{
    setTimeout(() =>{
      if(document.activeElement !==dateInput) saveEdit();
    },50);
  });

  dateInput.addEventListener('blur',()=>{
    setTimeout(() =>{
      if(document.activeElement !==dateInput) saveEdit();
    },50);
  });  

    const handleKeydown = (event) =>{
    if(event.key === 'Enter'){saveEdit();}
    if(event.key === 'Escape'){renderTodoList();}
  };

  nameInput.addEventListener('keydown', handleKeydown);
  dateInput.addEventListener('keydown',handleKeydown);
}
function toggleComplete(id) {
  
  const todo=todoList.find(t => t.id === id);
  if(!todo)return;
  todo.completed = !todo.completed;
  renderTodoList();
}
function updatedTabUI(activeTabSelector){
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  const activeTab=document.querySelector(activeTabSelector);
  if(activeTab)activeTab.classList.add('active');
  renderTodoList();
}
const tabAll=document.querySelector('.js-tab-all');
if(tabAll){
tabAll.addEventListener('click',() => {
  currentFilter='all';
  updatedTabUI('.js-tab-all');
});
}
const tabActive=document.querySelector('.js-tab-active');
if(tabActive){
tabActive.addEventListener('click',() => {
  currentFilter='active';
  updatedTabUI('.js-tab-active');
});
}
const tabCompleted=document.querySelector('.js-tab-completed');
if(tabCompleted){
tabCompleted.addEventListener('click',() => {
  currentFilter='completed';
  updatedTabUI('.js-tab-completed');
});
}

  



;(function () {
  'use strict'

  const get = (target) => {
    // querySelector를 이용해 css에서 사용하는 식으로 dom을 지정하는 함수를 만듦 (ex .=class / #=id 등)
    return document.querySelector(target)
  }

  const API_URL = 'http://localhost:3000/todos' // url 주소는 데이터를 CRUD할 때마다 쓰일 것이므로 상수로 선언
  // dom생성
  const $todos = get('.todos')
  const $form = get('.todo_form')
  const $todoInput = get('.todo_input')

  const createTodoElement = (item) => {
    // 이런식으로 HTML에 요소를 만들어 넣어줄 수 있음
    const { id, content, completed } = item // 데이터를 받을 때 id, content, completed를 받을 것이다
    const $todoItem = document.createElement('div')
    const isChecked = completed ? 'checked' : '' // completed 상태가 true라면 'checked'를 input 속성으로 넣어줄 예정
    $todoItem.classList.add('item')
    $todoItem.dataset.id = id
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked}
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `
    return $todoItem
  }

  const renderAllTodos = (todos) => {
    // 아래 목록을 만드는 역할. 서버에서 받은 데이터 배열을 todos로 넣을 예정
    $todos.innerHTML = ''
    todos.forEach((item) => {
      const todoElement = createTodoElement(item)
      $todos.appendChild(todoElement)
    })
  }

  const getTodos = () => {
    // fetch를 이용해 json서버에서 데이터 불러옴
    fetch(API_URL)
      .then((response) => response.json())
      .then((todos) => renderAllTodos(todos))
      .catch((error) => console.error(error))
  }

  const addTodo = (e) => {
    // submit버튼을 누르는 event가 발생했을 때 처리되어야할 것들
    e.preventDefault() // submit버튼을 눌렀을 때 새로고침되는 것을 막기 위해 (ajax를 이용할 예정)
    const todo = {
      content: $todoInput.value,
      completed: false,
    }
    fetch(API_URL, {
      // fetch로 서버에 데이터를 보내기
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // 리드미에 있는 header 그대로 복사해옴
      },
      body: JSON.stringify(todo),
    })
      .then(getTodos) // 서버로 데이터를 보내고 나서 아래 목록을 다시 불러와 반영되도록 하는 코드
      .then(() => {
        $todoInput.value = '' // 입력란을 비우고 focusing되게 하는 코드
        $todoInput.focus()
      })
      .catch((error) => console.error(error))
  }

  // 체크박스 눌렀을 때 데이터 반영
  const toggleTodo = (e) => {
    if (e.target.className !== 'todo_checkbox') return // 체크박스가 아닌 다른 곳을 클릭했을 때 아무것도 하지 않게
    const $item = e.target.closest('.item') // 해당 체크박스에 가장 가까운 클래스가 item인 요소를 찾아서 변수에 할당(체크박스들끼리 구분 위해)
    const id = $item.dataset.id // 해당요소의 dataset에서 id만 불러옴
    const completed = e.target.checked

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH', // 데이터의 프로퍼티 중 일부만 변경하기위해 patch사용, 전체 변경에는 put
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }), // 데이터의 completed의 값을 변경할 것이다 (true, false형태)
    })
      .then(getTodos) // 새로고침
      .catch((error) => console.error(error))
  }

  // 편집버튼 눌렀을 때 변화 구현
  const changeEditMode = (e) => {
    const $item = e.target.closest('.item') // 눌린 edit버튼과 가장 가까운 class가 item인 요소를 가져옴
    const $label = $item.querySelector('label') // querySelector 메서드로 item 내의 label요소를 가져옴
    const $editInput = $item.querySelector('input[type="text"]') // 편집창인 input요소도 가져옴
    const $contentButtons = $item.querySelector('.content_buttons')
    const $editButtons = $item.querySelector('.edit_buttons')
    const value = $editInput.value

    if (e.target.className === 'todo_edit_button') {
      $label.style.display = 'none'
      $editInput.style.display = 'block'
      $contentButtons.style.display = 'none'
      $editButtons.style.display = 'block'
      $editInput.focus()
      $editInput.value = ''
      $editInput.value = value // 편집 버튼 클릭 시 커서를 맨 끝으로 나타나게 하기 위해 아예 다시 불러옴
    }

    if (e.target.className === 'todo_edit_cancel_button') {
      $label.style.display = 'block'
      $editInput.style.display = 'none'
      $contentButtons.style.display = 'block'
      $editButtons.style.display = 'none'
      $editInput.value = $label.innerText // 취소버튼 누른 후 다시 편집버튼 눌렀을 때 수정 전 내용 그대로 유지되게 하기 위해
    }
  }

  // 편집완료 버튼 눌렀을 때 반영되게 하는 기능 구현
  const editTodo = (e) => {
    if (e.target.className !== 'todo_edit_confirm_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id
    const $editInput = $item.querySelector('input[type="text"]')
    const content = $editInput.value

    fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
      .then(getTodos) // 새로고침
      .catch((error) => console.error(error))
  }

  const removeTodo = (e) => {
    if (e.target.className !== 'todo_remove_button') return
    const $item = e.target.closest('.item')
    const id = $item.dataset.id

    fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    })
      .then(getTodos) // 새로고침
      .catch((error) => console.error(error))
  }

  const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
      getTodos()
    })
    $form.addEventListener('submit', addTodo)
    $todos.addEventListener('click', toggleTodo) // todo 체크박스를 클릭했을 때 데이터 상태를 바꿔주기 위해 이벤트 등록
    $todos.addEventListener('click', changeEditMode)
    $todos.addEventListener('click', editTodo)
    $todos.addEventListener('click', removeTodo)
  }
  init()
})()

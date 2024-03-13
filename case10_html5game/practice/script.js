;(function () {
  'use strict'

  const get = (target) => document.querySelector(target)

  const $canvas = get('.canvas')
  const ctx = $canvas.getContext('2d')

  const $score = get('.score')
  const $highScore = get('.highscore')
  const $play = get('.js-play')

  const colorSet = {
    board: '#1D2F6F',
    snakeHead: '#F88DAD',
    snakeBody: '#8390FA',
    food: '#FAC748',
  }

  let start = 0
  let option = {
    highScore: localStorage.getItem('score') || 0,
    gameEnd: true,
    direction: 2,
    snake: [
      { x: 10, y: 10, direction: 2 },
      { x: 10, y: 20, direction: 2 },
      { x: 10, y: 30, direction: 2 },
    ],
    food: { x: 0, y: 0 },
    score: 0,
  }

  const init = () => {
    document.addEventListener('keydown', (event) => {
      if (!/Arrow/gi.test(event.key)) {
        return
      }
      event.preventDefault() // 기본 이벤트를 막을 수 있음 (내가 지정하는 이벤트만 받아들이도록)
      const direction = getDirection(event.key)
      if (!isDirectionCorrect(direction)) {
        return
      }
      option.direction = direction
    })

    $play.onclick = () => {
      if (option.gameEnd) {
        option = {
          highScore: localStorage.getItem('score') || 0,
          gameEnd: false,
          direction: 2,
          snake: [
            { x: 10, y: 10, direction: 2 },
            { x: 10, y: 20, direction: 2 },
            { x: 10, y: 30, direction: 2 },
          ],
          food: { x: 0, y: 0 },
          score: 0,
        }
        $score.innerHTML = `점수 : 0점`
        $highScore.innerHTML = `최고점수 : ${option.highScore}점`
        randomFood()
        window.requestAnimationFrame(play)
      }
    }
  }

  const buildBoard = () => {
    ctx.fillStyle = colorSet.board
    ctx.fillRect(0, 0, 300, 300)
  }

  const buildSnake = (ctx, x, y, head = false) => {
    ctx.fillStyle = head ? colorSet.snakeHead : colorSet.snakeBody
    ctx.fillRect(x, y, 10, 10)
  }

  const buildFood = (ctx, x, y) => {
    ctx.beginPath()
    ctx.fillStyle = colorSet.food
    ctx.arc(x + 5, y + 5, 5, 0, 2 * Math.PI)
    ctx.fill()
  }

  const setSnake = () => {
    for (let i = option.snake.length - 1; i >= 0; --i) {
      buildSnake(ctx, option.snake[i].x, option.snake[i].y, i === 0)
    }
  }

  const setHighScore = () => {
    const localScore = option.highScore * 1 || 0
    const finalScore = $score.textContent.match(/(\d+)/)[0] * 1
    if (localScore < finalScore) {
      alert(`최고기록 : ${finalScore}점`)
      localStorage.setItem('score', finalScore)
    }
  }

  const setDirection = (number, value) => {
    while (value < 0) {
      // 화면을 벗어난 경우
      value += number // 화면 크기만큼 300을 더해주어 건너편에 보일 수 있도록
    }
    return value % number // 화면을 벗어나지 않은 경우 모듈러 연산으로 300 내의 숫자좌표가 나올 수 있도록 처리
  }

  // 음식 먹었을 때 몸이 길어지는 함수
  const setBody = () => {
    const tail = option.snake[option.snake.length - 1]
    const direction = tail.direction
    let x = tail.x
    let y = tail.y
    // 꼬리쪽 방향을 파악해 그쪽의 반대 방향(뒷부분)으로 요소를 넣어 붙여줌
    switch (direction) {
      // down
      case 1:
        y = setDirection(300, y - 10)
        break
      // up
      case -1:
        y = setDirection(300, y + 10)
        break
      // left
      case -2:
        x = setDirection(300, x + 10)
        break
      // right
      case 2:
        x = setDirection(300, x - 10)
        break
    }
    option.snake.push({ x, y, direction })
  }

  // 지렁이가 음식을 먹었을 때 작동해야하는 함수
  const getFood = () => {
    const snakeX = option.snake[0].x
    const snakeY = option.snake[0].y
    const foodX = option.food.x
    const foodY = option.food.y
    if (snakeX == foodX && snakeY == foodY) {
      option.score++
      $score.innerHTML = `점수 : ${option.score}`
      setBody()
      randomFood()
    }
  }

  // 음식 랜덤한 위치에 생성하게 하는 함수
  const randomFood = () => {
    let x = Math.floor(Math.random() * 25) * 10 // 캔버스 총 크기가 300 * 300인걸 고려해 범위를 정함
    let y = Math.floor(Math.random() * 25) * 10
    // some() : 배열 순회 메서드. 조건이 하나라도 만족하면 true반환
    while (option.snake.some((part) => part.x === x && part.y === y)) {
      // 뱀 머리와 음식의 위치가 만나면
      x = Math.floor(Math.random() * 25) * 10
      y = Math.floor(Math.random() * 25) * 10
    }
    option.food = { x, y }
  }

  // 지렁이의 움직임 함수
  const playSnake = () => {
    let x = option.snake[0].x
    let y = option.snake[0].y
    switch (option.direction) {
      // down
      case 1:
        y = setDirection(300, y + 10)
        break
      // up
      case -1:
        y = setDirection(300, y - 10)
        break
      // left
      case -2:
        x = setDirection(300, x - 10)
        break
      // right
      case 2:
        x = setDirection(300, x + 10)
        break
    }
    const snake = [{ x, y, direction: option.direction }]
    const snakeLength = option.snake.length
    for (let i = 1; i < snakeLength; ++i) {
      snake.push({ ...option.snake[i - 1] })
    }
    option.snake = snake
  }

  // 키보드 입력을 받아 direction으로 반환하는 함수
  const getDirection = (key) => {
    let direction = 0
    switch (key) {
      case 'ArrowDown':
        direction = 1
        break
      case 'ArrowUp':
        direction = -1
        break
      case 'ArrowLeft':
        direction = -2
        break
      case 'ArrowRight':
        direction = 2
        break
    }
    return direction
  }

  // 방향키가 작동하면 안되는 경우 설정하는 함수 (진행방향 && 역방향)
  const isDirectionCorrect = (direction) => {
    return (
      option.direction === option.snake[0].direction &&
      option.direction !== -direction
    )
  }

  const isGameOver = () => {
    const head = option.snake[0]
    return option.snake.some(
      (body, index) => index !== 0 && head.x === body.x && head.y === body.y
    )
  }

  const play = (timestamp) => {
    // requestAnimationFrame방법을 통해 반복적인 움직임의 애니메이션 구현할 예정
    start++
    if (option.gameEnd) {
      return
    }

    // timestamp 계속 증가, start(초기값:0)도 계속 증가 - 무한반복
    // 예외처리 안에 반복되는 것들을 넣어줄 것
    if (timestamp - start > 1000 / 10) {
      if (isGameOver()) {
        option.gameEnd = true
        setHighScore()
        alert('게임오버!')
        return
      }
      playSnake() // 지렁이 움직임 함수
      buildBoard() // 보드 생성
      buildFood(ctx, option.food.x, option.food.y) // 푸드 랜덤 위치에 생성
      setSnake() // 지렁이 위치 갱신
      getFood() // 음식 먹었을 때
      start = timestamp
    }
    window.requestAnimationFrame(play) // 반복을 위한 재귀함수 호출
  }

  init()
})()

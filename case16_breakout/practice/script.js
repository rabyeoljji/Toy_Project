;(function () {
   'use strict'

   const get = (element) => document.querySelector(element)

   const keyEvent = (control, func) => {
      document.addEventListener(control, func, false)
   }
   // 클래스 생성
   class BrickBreak {
      constructor(parent = 'body', data = {}) {
         this.parent = get(parent)
         this.canvas = document.createElement('canvas')
         this.canvas.setAttribute('width', 480)
         this.canvas.setAttribute('height', 340)
         this.ctx = this.canvas.getContext('2d')
         this.fontFamily = "20px 'Courier New', Courier, monospace"
         this.score = 0
         this.lives = data.lives
         this.speed = data.speed
         this.image = document.createElement('img')
         this.bg = data.bg
         this.radius = 10
         this.ballX = this.canvas.width / 2
         this.ballY = this.canvas.height - 30
         this.directX = data.speed
         this.directY = -data.speed // 방향이 항상 위로 튕길 수 있게 (브라우저 좌표는 아래쪽이 양수, 위쪽이 음수방향이다. 좌상단이 0.0)
         this.paddleWidth = data.paddleWidth
         this.paddleHeight = data.paddleHeight
         this.rightPressed = false
         this.leftPressed = false
         this.paddleX = (this.canvas.width - this.paddleWidth) / 2
         this.brickRow = data.brickRow
         this.brickCol = data.brickCol
         this.brickWidth = data.brickWidth
         this.brickHeight = data.brickHeight
         this.brickPad = data.brickPad
         this.brickPosX = data.brickPosX
         this.brickPosY = data.brickPosY
         this.ballColor = data.ballColor
         this.paddleColor = data.paddleColor
         this.fontColor = data.fontColor
         this.brickStartColor = data.brickStartColor
         this.brickEndColor = data.brickEndColor
         this.image.setAttribute('src', this.bg)
         this.parent.appendChild(this.canvas)
         this.bricks = []
      }

      // 초기화 메서드
      init = () => {
         // 벽돌 배열 만들기 (열, 행 이중배열)
         for (let colIndex = 0; colIndex < this.brickCol; colIndex++) {
            this.bricks[colIndex] = []
            for (let rowIndex = 0; rowIndex < this.brickRow; rowIndex++) {
               this.bricks[colIndex][rowIndex] = { x: 0, y: 0, status: 1 } // 각각의 벽돌이 있을 열과 행에 좌표를 넣어줌
            }
         }
         this.keyEvent()
         this.draw()
      }

      // 키보드 입력을 받아 하단 받침대를 움직이게 하기 위한 이벤트함수
      keyupEvent = (event) => {
         if ('Right' === event.key || 'ArrowRight' === event.key) {
            this.rightPressed = false
         } else if ('Left' === event.key || 'ArrowLeft' === event.key) {
            this.leftPressed = false
         }
      }

      // 키보드 입력을 받아 하단 받침대를 움직이게 하기 위한 이벤트함수
      keydownEvent = (event) => {
         if ('Right' === event.key || 'ArrowRight' === event.key) {
            this.rightPressed = true
         } else if ('Left' === event.key || 'ArrowLeft' === event.key) {
            this.leftPressed = true
         }
      }

      // 마우스 좌표에 따라 받침대를 움직히게 하기 위한 이벤트함수
      mousemoveEvent = (event) => {
         const positionX = event.clientX - this.canvas.offsetLeft // positionX 값을 캔버스 내로 한정하기 위해

         if (0 < positionX && positionX < this.canvas.width) {
            this.paddleX = positionX - this.paddleWidth / 2 // 마우스를 패들의 중심으로 인식시키기 위한 계산
         }
      }

      // 클래스 내부 메서드로 keyEvent 생성 (외부 keyEvent함수들을 작동시키는 역할)
      keyEvent = () => {
         keyEvent('keyup', this.keyupEvent)
         keyEvent('keydown', this.keydownEvent)
         keyEvent('mousemove', this.mousemoveEvent)
      }

      // 캔버스에 공 그리기
      drawBall = () => {
         this.ctx.beginPath()
         this.ctx.arc(this.ballX, this.ballY, this.radius, 0, Math.PI * 2)
         this.ctx.fillStyle = this.ballColor
         this.ctx.fill()
         this.ctx.closePath()
      }

      // 캔버스에 받침대 그리기
      drawPaddle = () => {
         this.ctx.beginPath()
         this.ctx.rect(
            this.paddleX,
            this.canvas.height - this.paddleHeight,
            this.paddleWidth,
            this.paddleHeight
         )
         this.ctx.fillStyle = this.paddleColor
         this.ctx.fill()
         this.ctx.closePath()
      }

      drawBricks = () => {
         let brickX = 0
         let brickY = 0
         let gradient = this.ctx.createLinearGradient(0, 0, 200, 0) // 캔버스 위치상 200정도의 gradient를 부여하기 위해
         gradient.addColorStop(0, this.brickStartColor) // 0이 gradient의 시작부분
         gradient.addColorStop(1, this.brickEndColor) // 1이 gradient의 끝부분

         // 만들어두었던 블록 이중 배열을 돌면서 블록 설정
         for (let colIndex = 0; colIndex < this.brickCol; colIndex++) {
            for (let rowIndex = 0; rowIndex < this.brickRow; rowIndex++) {
               if (1 !== this.bricks[colIndex][rowIndex].status) {
                  continue
               } // status가 1이 아니면 존재하지 않는다는 뜻, continue를 통해 건너 뛰어 그리지 않는다.
               brickX =
                  colIndex * (this.brickWidth + this.brickPad) + this.brickPosX
               // brick의 x좌표들의 간격은 첫 좌표(brickPosX)에서 브릭의 너비와 브릭 사이의 간격을 더한 값이므로
               brickY =
                  rowIndex * (this.brickHeight + this.brickPad) + this.brickPosY

               this.bricks[colIndex][rowIndex].x = brickX
               this.bricks[colIndex][rowIndex].y = brickY

               this.ctx.beginPath()
               this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight)
               this.ctx.fillStyle = gradient
               this.ctx.fill()
               this.ctx.closePath()
            }
         }
      }

      // 좌상단 점수 텍스트 그리기
      drawScore = () => {
         this.ctx.font = this.fontFamily
         this.ctx.fillStyle = this.fontColor
         this.ctx.fillText('점수 : ' + this.score, 10, 22)
      }

      // 우상단 남은 목숨 텍스트 그리기
      drawLives = () => {
         this.ctx.font = this.fontFamily
         this.ctx.fillStyle = this.fontColor
         this.ctx.fillText('목숨 : ' + this.lives, this.canvas.width - 100, 22)
      }

      // 벽돌 충돌 구현
      detectCollision = () => {
         let currentBrick = {}

         for (let colIndex = 0; colIndex < this.brickCol; colIndex++) {
            for (let rowIndex = 0; rowIndex < this.brickRow; rowIndex++) {
               currentBrick = this.bricks[colIndex][rowIndex]

               if (1 !== currentBrick.status) {
                  // (status=0)없어진 블록의 경우 무시하고 다음순서로 넘어가게 함
                  continue
               }
               // ball이 벽돌의 좌우 면에 닿았을 때, 벽돌의 상하 면에 닿았을 때 조건
               if (
                  this.ballX > currentBrick.x &&
                  this.ballX < currentBrick.x + this.brickWidth &&
                  this.ballY > currentBrick.y &&
                  this.ballY < currentBrick.y + this.brickHeight
               ) {
                  this.directY = -this.directY
                  currentBrick.status = 0
                  this.score++

                  if (this.score !== this.brickCol * this.brickRow) {
                     continue
                  }
                  alert('승리했습니다!')
                  this.reset()
               }
            }
         }
      }

      draw = () => {
         this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // 전체 캔버스 영역을 지워주고 다시 세팅하기 위해

         // 배경이미지 그리기
         this.ctx.drawImage(
            this.image,
            this.canvas.width / 2 - this.image.width / 2,
            this.canvas.height / 2 - this.image.height / 2
         ) // 크기조절을 해준 것

         // 요소 화면에 그리는 함수들
         this.drawBall()
         this.drawPaddle()
         this.drawBricks()
         this.drawScore()
         this.drawLives()
         this.detectCollision()

         // 화면 내부에서 공이 튕기는 것을 구현하기 위한 조건
         // 볼의 표면이 캔버스의 오른쪽에 닿거나, 왼쪽에 닿을 경우 계산
         if (
            this.ballX + this.directX > this.canvas.width - this.radius ||
            this.ballX + this.directX < this.radius
         ) {
            this.directX = -this.directX // 방향을 반대로 바꿔줌
         }
         // 볼의 표면이 캔버스의 위쪽에 닿을 경우 계산
         if (this.ballY + this.directY < this.radius) {
            this.directY = -this.directY // 방향을 반대로 바꿔줌
         } // 볼의 표면이 캔버스의 아래쪽에 닿을 경우 계산
         else if (
            this.ballY + this.directY >
            this.canvas.height - this.radius
         ) {
            if (
               // 공이 패들의 범위 내의 x좌표일 때 (패들과 닿음)
               this.ballX > this.paddleX &&
               this.ballX < this.paddleX + this.paddleWidth
            ) {
               this.directY = -this.directY // 방향을 반대로 바꿔줌
            } else {
               // 패들과 닿지 않고 그냥 캔버스 아래로 넘어갔을 때
               this.lives--
               if (0 === this.lives) {
                  // 남은 목숨이 0이되면
                  alert('실패하였습니다.')
                  this.reset()
               } else {
                  // 목숨이 남아있을 경우
                  // 볼 위치 정중앙으로 원상복귀 + 방향 재설정 + 패들 재설정
                  this.ballX = this.canvas.width / 2
                  this.ballY = this.canvas.height - this.paddleHeight
                  this.directX = this.speed
                  this.directY = -this.speed
                  this.paddleX = (this.canvas.width - this.paddleWidth) / 2
               }
            }
         }

         // 키도 누르는 동안 좌표값이 증가할 수 있도록 해줌 (받침대의 이동구현)
         if (
            this.rightPressed &&
            this.paddleX < this.canvas.width - this.paddleWidth // 바의 x좌표가 증가할 수 있는 최대값
         ) {
            this.paddleX += 7
         } else if (this.leftPressed && 0 < this.paddleX) {
            // 바의 x좌표가 감소할 수 있는 최소값
            this.paddleX -= 7
         }

         // ball의 좌표를 direct 만큼 증가해줌
         this.ballX += this.directX
         this.ballY += this.directY

         requestAnimationFrame(this.draw)
      }

      // 게임이 끝나면 다시 시작할 수 있도록 reset함수 만들어줌
      reset = () => {
         document.location.reload()
      }
   }

   const data = {
      lives: 5,
      speed: 2,
      paddleHeight: 10,
      paddleWidth: 75,
      bg: './assets/bg.jpeg',
      ballColor: '#90D6FF',
      paddleColor: '#05aff2',
      fontColor: '#F396A4',
      brickStartColor: '#FBC7D0',
      brickEndColor: '#F396A4',
      brickRow: 4,
      brickCol: 5,
      brickWidth: 75,
      brickHeight: 20,
      brickPad: 10,
      brickPosX: 30,
      brickPosY: 30,
   }

   const brickBreak = new BrickBreak('.canvas', data)
   brickBreak.init()
})()

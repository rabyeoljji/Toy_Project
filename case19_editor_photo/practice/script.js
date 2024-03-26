;(function () {
   'use strict'

   const get = (element) => document.querySelector(element)
   class PhotoEditor {
      constructor() {
         this.container = get('main')
         this.canvas = get('canvas')
         this.ctx = this.canvas.getContext('2d')
         this.width = 700
         this.height = 411
         this.minSize = 20
         this.canvas.width = this.width
         this.canvas.height = this.height
         this.ctx.lineWidth = 4
         this.ctx.strokeStyle = '#ff0000'
         this.targetImage = get('.image_wrap')
         this.targetCanvas = document.createElement('canvas')
         this.targetCtx = this.targetCanvas.getContext('2d')
         this.targetWidth
         this.targetHeight
         this.sourceX
         this.sourceY
         this.sourceWidth
         this.img = new Image()
         this.btnFlip = get('.btn_flip')
         this.btnSepia = get('.btn_sepia')
         this.btnGray = get('.btn_gray')
         this.btnSave = get('.btn_save')
         this.fileDrag = get('.drag_area')
         this.fileInput = get('.drag_area input')
         this.fileImage = get('.fileImage')
         this.clickEvent()
         this.fileEvent()
         this.drawEvent()
      }

      clickEvent() {
         this.btnFlip.addEventListener('click', this.flipEvent.bind(this))
         this.btnSepia.addEventListener('click', this.sepiaEvent.bind(this))
         this.btnGray.addEventListener('click', this.grayEvent.bind(this))
         this.btnSave.addEventListener('click', this.download.bind(this))
      }

      // 좌우반전 기능버튼
      flipEvent() {
         this.targetCtx.translate(this.targetWidth, 0)
         this.targetCtx.scale(-1, 1)
         this.targetCtx.drawImage(
            this.img,
            this.sourceX,
            this.sourceY,
            this.sourceWidth,
            this.sourceHeight,
            0,
            0,
            this.targetWidth,
            this.targetHeight
         )
      }

      sepiaEvent() {
         this.targetCtx.clearRect(0, 0, this.targetWidth, this.targetHeight)
         this.targetCtx.filter = 'sepia(1)'
         this.targetCtx.drawImage(
            this.img,
            this.sourceX,
            this.sourceY,
            this.sourceWidth,
            this.sourceHeight,
            0,
            0,
            this.targetWidth,
            this.targetHeight
         )
      }

      grayEvent() {
         this.targetCtx.clearRect(0, 0, this.targetWidth, this.targetHeight)
         this.targetCtx.filter = 'grayscale(1)'
         this.targetCtx.drawImage(
            this.img,
            this.sourceX,
            this.sourceY,
            this.sourceWidth,
            this.sourceHeight,
            0,
            0,
            this.targetWidth,
            this.targetHeight
         )
      }

      download() {
         const url = this.targetCanvas.toDataURL()
         const downloader = document.createElement('a')
         downloader.style.display = 'none'
         downloader.setAttribute('href', url)
         downloader.setAttribute('download', 'canvas.png')
         this.container.appendChild(downloader)
         downloader.click()
         // 이렇게 생성된 다운로드 기능의 a태그를 삭제하지 않으면 계속 생성이 될 것
         // setTimeout으로 거의 바로 삭제가 되도록 아래와같이 코드 작성
         setTimeout(() => {
            this.container.removeChild(downloader)
         }, 100)
      }

      // 파일 삽입 이벤트 함수 (드래그 앤 드롭)
      fileEvent() {
         this.fileInput.addEventListener('change', (event) => {
            // fileInput 돔에 input 값이 변화했을 시를 위한 이벤트를 등록해
            const fileName = URL.createObjectURL(event.target.files[0]) // 이벤트 타겟 첫번째 파일의 url객체를 fileName으로 할당
            const img = new Image()
            img.addEventListener('load', (e) => {
               // 이미지 객체를 만들어 로드 이벤트를 등록해
               this.width = e.path[0].naturalWidth
               this.height = e.path[0].naturalHeight
            })
            // 로드가 될때 이미지의 원래 크기값을 따로 저장하도록
            this.fileImage.setAttribute('src', fileName)
            // 그리고 fileImage돔의 src속성을 로드할 이미지 url이 담겨있는 fileName으로 설정해줌
         })
      }

      // 크롭 기능 구현을 위한 이벤트 함수
      drawEvent() {
         const canvasX = this.canvas.getBoundingClientRect().left // 캔버스가 시작하는 x좌표를 가져오기 위해 getBoundingClientRect().left
         const canvasY = this.canvas.getBoundingClientRect().top // 캔버스가 시작하는 y좌표를 가져오기 위해 getBoundingClientRect().top
         let sX, sY, eX, eY // 시작 x,y 좌표값, 끝 x,y 좌표값을 변수로 선언해줌
         let drawStart = false // 크롭을 시작했다는 것을 의미하는 drawStart변수를 만들어 false로

         this.canvas.addEventListener('mousedown', (e) => {
            // 마우스를 누르기 시작하면 이벤트 발생
            sX = parseInt(e.clientX - canvasX, 10) // 캔버스 안에서의 x좌표
            sY = parseInt(e.clientY - canvasY, 10) // 캔버스 안에서의 y좌표
            drawStart = true
         })

         this.canvas.addEventListener('mousemove', (e) => {
            if (!drawStart) return // 마우스를 누른 채로 이동하지 않았을 경우 그냥 아무일도 없이
            eX = parseInt(e.clientX - canvasX, 10)
            eY = parseInt(e.clientY - canvasY, 10)
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) // 캔버스 깨끗하게 지우기 (원래상태로)
            this.ctx.strokeRect(sX, sY, eX - sX, eY - sY) // 마우스를 이동한 좌표를 계산해 그 영역만큼 사각형 그리기
            // (시작x좌표, 시작y좌표, 넓이, 높이)
         })

         this.canvas.addEventListener('mouseup', () => {
            drawStart = false

            if (
               Math.abs(eX - sX) < this.minSize ||
               Math.abs(eY - sY) < this.minSize
            ) {
               return
            }
            this.drawOutput(sX, sY, eX - sX, eY - sY)
         })
      }

      drawOutput(x, y, width, height) {
         this.targetImage.innerHTML = ''
         if (Math.abs(width) <= Math.abs(height)) {
            // 크롭한 이미지가 가로너비가 세로보다 작을 때
            this.targetHeight = this.height // 우선 세로는 원본 세로 크기로 늘려주고
            this.targetWidth = (this.targetHeight * width) / height // 비율 맞춰주는 계산
         } else {
            this.targetWidth = this.width
            this.targetHeight = (this.targetWidth * height) / width
         }
         // 캔버스 크기 조절
         this.targetCanvas.width = this.targetWidth
         this.targetCanvas.height = this.targetHeight

         // 이미지가 로드됐을 시 작동할 함수
         this.img.addEventListener('load', () => {
            const buffer = this.img.width / this.width
            this.sourceX = x * buffer
            this.sourceY = y * buffer
            this.sourceWidth = width * buffer
            this.sourceHeight = height * buffer
            this.targetCtx.drawImage(
               this.img,
               this.sourceX,
               this.sourceY,
               this.sourceWidth,
               this.sourceHeight,
               0,
               0,
               this.targetWidth,
               this.targetHeight
            )
         })

         // 결과물을 보여주는 targetImage돔에 이미지 삽입해줌
         this.img.src = this.fileImage.getAttribute('src')
         this.targetImage.appendChild(this.targetCanvas)
      }
   }

   new PhotoEditor()
})()

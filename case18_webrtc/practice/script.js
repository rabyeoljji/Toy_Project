;(() => {
   'use strict'

   const get = (element) => document.querySelector(element)
   const allowUser = {
      audio: true,
      video: true,
   }

   class WebRtc {
      constructor() {
         this.media = new MediaSource()
         this.recorder
         this.blobs
         this.playedVideo = get('video.played')
         this.recordVideo = get('video.record')
         this.btnDownload = get('.btn_download')
         this.btnRecord = get('.btn_record')
         this.btnPlay = get('.btn_play')
         this.container = get('.webrtc')
         this.events()
         navigator.mediaDevices.getUserMedia(allowUser).then((videoAudio) => {
            // navigator의 mediaDevices.getUserMedia()를 이용하면 promise객체가 반환된다 (videoAudio = 프로미스객체)
            this.success(videoAudio) // then을 이용해 받은 값을 success()메서드에 넣어 결과를 반환함
         })
      }

      events() {
         // 현재 this에 record, play, download기능을 가진 메서드들을 명시적으로 바인딩해서 이벤트를 등록해주었다.
         this.btnRecord.addEventListener('click', this.toggleRecord.bind(this))
         this.btnPlay.addEventListener('click', this.play.bind(this))
         this.btnDownload.addEventListener('click', this.download.bind(this))
      }

      // 성공시 수행할 succes()메서드
      success(audioVideo) {
         this.btnRecord.removeAttribute('disabled') // 녹화 버튼 활성화하기 위해 disabled속성 지움
         window.stream = audioVideo // 나중에 사용하기 위해 window.stream에 audioVideo를 저장
         if (window.URL) {
            // window.URL이 있으면
            this.playedVideo.setAttribute(
               // playedVideo돔에 src속성으로 동영상url 삽입
               'src',
               window.URL.createObjectURL(audioVideo)
            )
         } else {
            this.playedVideo.setAttribute('src', audioVideo)
         }
      }

      // record를 시작하고 멈추는 기능의 메서드
      toggleRecord() {
         if ('녹화' === this.btnRecord.textContent) {
            // 버튼에 녹화라고 적혀있는 상태면 아직 녹화버튼이 눌리지 않은 상태이다. 그러므로
            this.startRecord() // 녹화를 시작
         } else {
            // 녹화중이었던 상황에서는 아래와같이 동작하게 함
            this.btnPlay.removeAttribute('disabled')
            this.btnDownload.removeAttribute('disabled')
            this.btnRecord.textContent = '녹화'
            this.stopRecord()
         }
      }

      pushBlobData(event) {
         if (!event.data || event.data.size < 1) {
            // 발생한 이벤트의 data가 없거나, data 크기가 1보다 작을 경우
            return
         }
         this.blobs.push(event.data)
         // 그렇지 않다면 미리 만들어준 blobs배열에 데이터를 push해 준다
      }

      // 녹화 시작 메서드
      startRecord() {
         let type = { mimeType: 'video/webm;codecs=vp9' }
         this.blobs = []
         if (!MediaRecorder.isTypeSupported(type.mimeType)) {
            // (window객체의 MediaRecorder.isTypeSupported를 이용해 지원하는 타입인지 확인할 수 있음)
            // 현재 video의 타입이 지원하지 않는 타입일 경우
            type = { mimeType: 'video/webm' } // 그냥 기본 타입으로 설정해줌
         }
         this.recorder = new MediaRecorder(window.stream, type) // recorder에 MediaRecorder객체 이용해 동영상 녹화해 저장
         // 버튼들 설정 바꿔줌
         this.btnRecord.textContent = '중지'
         this.btnPlay.setAttribute('disabled', true)
         this.btnDownload.setAttribute('disabled', true)
         this.recorder.ondataavailable = this.pushBlobData.bind(this)
         // pushBlobData()메서드를 만들어서 recorder의 데이터가 ondataavailable이면
         // blob데이터로 바꿔 push해줄 것이다. (다운로드 받을 수 있도록)
         this.recorder.start(20) // MediaRecorder객체에 있는 start()메서드로 20초동안 녹화할 수 있도록 설정
      }

      // 녹화 중지 메서드
      stopRecord() {
         this.recorder.stop()
         this.recordVideo.setAttribute('controls', true) // recordVideo돔에 controls속성을 추가해 비디오를 재생할 수 있는 상태로 만들어줌
      }

      // 영상 play 메서드
      play() {
         this.recordVideo.src = window.URL.createObjectURL(
            // recordVideo돔에 src로 동영상url을 생성하는 메서드로 blob객체를 전달해 할당
            new Blob(this.blobs, { type: 'video/webm' })
         )
      }

      // 영상 download 메서드
      download() {
         const videoFile = new Blob(this.blobs, { type: 'video/webm' }) // blob객체를 videoFile에 저장
         const url = window.URL.createObjectURL(videoFile)
         const downloader = document.createElement('a') // 다운로드를 하기 위한 버튼 생성
         downloader.style.display = 'none' // 다운로드의 '기능만' 필요한 것이므로 보이지 않도록 함
         downloader.setAttribute('href', url)
         downloader.setAttribute('download', 'test_video.webm') // setAttribute()로 다운로드기능구현이 가능하다
         this.container.appendChild(downloader)
         downloader.click() // 이 함수가 실행되면 자동으로 클릭되게끔
         setTimeout(() => {
            this.container.removeChild(downloader)
            window.URL.revokeObjectURL(url)
         }, 100) // 약간의 텀을 두고 다운로드 기능을 가진 a태그와 url을 삭제해줌
      }
   }

   new WebRtc()
})()

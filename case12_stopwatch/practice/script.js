;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  // 구현 point) 자바스크립트의 이벤트 발생 시간은 정확하지 않다 - 실제 시간과 비교할 것

  class Stopwatch {
    constructor(element) {
      this.timer = element
      this.interval = null
      this.defaultTime = '00:00.00'
      this.startTime = 0
      this.elapsedTime = 0 // 경과된 시간
    }

    // 시간 표기를 두 자리로 하기 위해
    addZero(number) {
      if (number < 10) {
        return '0' + number
      }
      if (number > 99) {
        return number.toString().slice(0, -1) // 문자로 바꾸고 끝부분을 잘라줌
      }
      return number
    }

    // ms단위로 시행되는 인터벌숫자를 표기하는 방법을 변경하는 함수
    timeToString(time) {
      const date = new Date(time) // 경과된 시간을 계산한 것을 date객체로 생성
      const minutes = date.getUTCMinutes()
      const seconds = date.getUTCSeconds()
      const millisecond = date.getUTCMilliseconds()
      return `${this.addZero(minutes)}:${this.addZero(seconds)}.${this.addZero(millisecond)}`
      // 이런식으로 간단하게 분 초를 가져올 수 있음
    }

    print(text) {
      this.timer.innerHTML = text
    }

    // 경과된 시간을 계산해 타이머에 적용
    startTimer() {
      this.elapsedTime = Date.now() - this.startTime
      const time = this.timeToString(this.elapsedTime) // 시간표기 변경을 위해
      this.print(time)
    }

    // start 버튼 작동 함수
    start() {
      clearInterval(this.interval)
      // start를 누를 때마다 아래 코드로 interval이 생성되어 stop을 눌러도 해당 interval이 clear되지 않는 버그를 막기 위해
      this.startTime = Date.now() - this.elapsedTime // 이러면 stop후 start를 눌러도 시간이 유지가 됨
      this.interval = setInterval(this.startTimer.bind(this), 10) // 명시적 바인딩으로 this = stopwatch가 되도록
    }
    // stop 버튼 작동 함수
    stop() {
      clearInterval(this.interval)
    }
    // reset 버튼 작동 함수
    reset() {
      clearInterval(this.interval)
      this.print(this.defaultTime)
      this.interval = null
      this.startTime = 0
      this.elapsedTime = 0
    }
  }

  const $startButton = get('.timer_button.start')
  const $stopButton = get('.timer_button.stop')
  const $resetButton = get('.timer_button.reset')
  const $timer = get('.timer')
  const stopwatch = new Stopwatch($timer)

  $startButton.addEventListener('click', () => {
    stopwatch.start()
  })
  $stopButton.addEventListener('click', () => {
    stopwatch.stop()
  })
  $resetButton.addEventListener('click', () => {
    stopwatch.reset()
  })
})()

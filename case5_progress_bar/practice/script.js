;(function () {
  'use strict'

  let timerId
  const get = (target) => {
    return document.querySelector(target)
  }

  // 기본적인 throttle 구현
  // (함수 실행 주기를 조절해 연속된 이벤트 발생 시 모든 이벤트마다 대응하지 않고 효율적으로 자원을 이용하는 방법)
  const throttle = (callback, time) => {
    // 실행할 함수와 주기를 입력받아
    if (timerId) return
    timerId = setTimeout(() => {
      // setTimeout()을 이용해 지정한 time마다 함수 실행해주고 timer초기화까지 해줌
      callback()
      timerId = undefined
    }, time)
  }

  const $progresBar = get('.progress-bar')

  const onScroll = () => {
    // 보이지 않는 남은 영역의 스크롤 높이 구하기
    // scrollHeight : 전체 스크롤 높이 / clientHeight : 보여지는 영역의 높이
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight

    // scrollTop : 현재까지 스크롤 된 높이
    const scrollTop = document.documentElement.scrollTop

    // 프로그레스바의 늘어나는 너비는 남은 전체 높이 중 스크롤 된 높이의 비율이므로 아래와같이 %로 변환해주면 된다
    const width = (scrollTop / height) * 100
    $progresBar.style.width = width + '%'
  }

  window.addEventListener('scroll', () => throttle(onScroll, 100))
})()

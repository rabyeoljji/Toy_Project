;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  const cellCount = 6 // (아이템 개수)
  let selectIndex = 0 // 앞에 보여질 아이템의 index
  const prevButton = get('.prev_button')
  const nextButton = get('.next_button')
  const carousel = get('.carousel')

  const rotateCarousel = () => {
    // 0번 아이템은 -0도, 1번 아이템은 -60도, 2번 아이템은 -120도, ...
    // css에 설정된 아이템의 기울임 각도와 반대각도로 회전해주어야 하기 때문에 마이너스를 붙여줌
    const angle = (selectIndex / cellCount) * -360
    carousel.style.transform = `translateZ(-346px) rotateY(${angle}deg)`
  }

  prevButton.addEventListener('click', () => {
    selectIndex--
    rotateCarousel()
  })
  nextButton.addEventListener('click', () => {
    selectIndex++
    rotateCarousel()
  })
})()

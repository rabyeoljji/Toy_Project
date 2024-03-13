;(function () {
  'use strict'

  const get = (target) => {
    return document.querySelector(target)
  }

  // 캐러셀 클래스를 만들어보자
  class Carousel {
    constructor(carouselElement) {
      this.carouselElement = carouselElement
      this.itemClassName = 'carousel_item'
      this.items = this.carouselElement.querySelectorAll('.carousel_item')

      this.totalItems = this.items.length
      this.current = 0
      this.isMoving = false
    }

    // 캐러셀 초기화 - 처음아이템을 current로 설정
    initCarousel() {
      this.isMoving = false
      this.items[0].classList.add('active')
      this.items[1].classList.add('next')
      this.items[this.totalItems - 1].classList.add('prev')
    }

    // 버튼을 연속으로 눌렀을 때, 모든 이벤트에 반응하지 않고 지연되게 하기 위해
    disabledInteraction() {
      this.isMoving = true
      setTimeout(() => {
        this.isMoving = false
      }, 500)
    }

    // 버튼에 이벤트 등록
    setEventListener() {
      this.prevButton = this.carouselElement.querySelector(
        '.carousel_button--prev'
      )
      this.nextButton = this.carouselElement.querySelector(
        '.carousel_button--next'
      )

      this.prevButton.addEventListener('click', () => {
        this.movePrev()
      })
      this.nextButton.addEventListener('click', () => {
        this.moveNext()
      })
    }

    moveCarouselTo() {
      if (this.isMoving) return

      this.disabledInteraction() // 캐러셀이 움직이기 시작하면 버튼지연동작
      // 이전 아이템과 다음 아이템의 클래스에 붙여줄 prev와 next
      let prev = this.current - 1
      let next = this.current + 1

      if (this.current === 0) {
        prev = this.totalItems - 1
      } else if (this.current === this.totalItems - 1) {
        next = 0
      }

      // 아이템들에 맞는 클래스명을 붙여주기
      for (let i = 0; i < this.totalItems; i++) {
        if (i === this.current) {
          this.items[i].className = this.itemClassName + ' active' // class명을 이렇게 붙여줄 수도 있음
        } else if (i === prev) {
          this.items[i].className = this.itemClassName + ' prev'
        } else if (i === next) {
          this.items[i].className = this.itemClassName + ' next'
        } else {
          this.items[i].className = this.itemClassName
        }
      }
    }

    moveNext() {
      if (this.isMoving) return
      if (this.current === this.totalItems - 1) {
        // current가 총아이템개수 - 1일 때(마지막요소)
        this.current = 0 // moveNext()실행 시, current를 첫 요소로 설정해주기 위해
      } else {
        this.current++
      }
      this.moveCarouselTo()
    }

    movePrev() {
      if (this.isMoving) return
      if (this.current === 0) {
        this.current = this.totalItems - 1
      } else {
        this.current--
      }
      this.moveCarouselTo()
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const carouselElement = get('.carousel')
    const carousel = new Carousel(carouselElement)

    carousel.initCarousel() // 캐러셀 초기화
    carousel.setEventListener() // 각 버튼에 이벤트 등록
  })
})()

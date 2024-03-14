;(function () {
   'use strict'

   const get = (target) => {
      return document.querySelector(target)
   }

   const getAll = (target) => {
      return document.querySelectorAll(target)
   }

   class Calculator {
      constructor(element) {
         this.element = element
         this.currentValue = ''
         this.prevValue = ''
         this.operation = null
      }

      // 전체 초기화 AC 메서드
      reset() {
         this.currentValue = ''
         this.prevValue = ''
         this.resetOperation()
      }
      // 이전단계를 취소하는 C 메서드
      clear() {
         // 1. 숫자가 입력되어있는 상태일 때 (입력된 숫자 삭제 필요)
         if (this.currentValue) {
            this.currentValue = ''
            return
         }
         // 2. 연산자가 입력되어있는 상태일 때 (연산자 삭제 + 이전 숫자 불러오기)
         if (this.operation) {
            this.resetOperation()
            this.currentValue = this.prevValue
            return
         }
         // 3. 이전에 연산을 위해 저장된 값이 있는 상태일 때 (이전 숫자 초기화)
         if (this.prevValue) {
            this.prevValue = ''
         }
      }
      // 숫자를 입력하면 하나씩 자릿수에 붙여주는 메서드
      appendNumber(number) {
         if (number === '.' && this.currentValue.includes('.')) return // 소수점이 한 번만 찍히도록
         this.currentValue = this.currentValue.toString() + number.toString() // 문자열로 해야 뒤에 붙일 수 있음 (숫자는 +연산이 됨)
      }
      // 연산자를 받아 해당 연산자를 활성화하는 메서드
      setOperation(operation) {
         this.resetOperation()
         this.operation = operation
         this.prevValue = this.currentValue // 이전 값에 값을 저장해주고
         this.currentValue = '' // 현재 값 초기화

         // 클릭된 연산자의 색상을 active상태로 유지하기 위해
         const elements = Array.from(getAll('.operation')) // 연산자들 유사배열객체를 배열로 변경
         const element = elements.filter((element) =>
            element.innerText.includes(operation)
         )[0] // 배열메서드 filter()를 이용해 현재 받은 operation과 일치하는 요소를 찾아

         element.classList.add('active') // 해당 요소에 active 클래스 추가
      }
      // 화면에 보여지는 숫자를 업데이트하는 메서드
      updateDisplay() {
         if (this.currentValue) {
            this.element.value = this.currentValue
            return
         }
         if (this.prevValue) {
            this.element.value = this.prevValue
            return
         }
         this.element.value = 0
      }
      // 연산자 활성화를 끄고 초기화하는 메서드
      resetOperation() {
         this.operation = null
         const elements = Array.from(getAll('.operation'))
         elements.forEach((element) => {
            element.classList.remove('active')
         })
      }
      // 계산하는 메서드
      compute() {
         let computation
         const prev = parseFloat(this.prevValue) // 소수점 계산을 위해 float으로 형변환
         const current = parseFloat(this.currentValue)
         if (isNaN(prev) || isNaN(current)) return

         switch (this.operation) {
            case '+':
               computation = prev + current
               break
            case '-':
               computation = prev - current
               break
            case '*':
               computation = prev * current
               break
            case '÷':
               computation = prev / current
               break
            default:
               return
         }
         this.currentValue = computation.toString() // 이렇게 해야 계산기 화면상 뒤에 숫자를 붙일 수 있음
         this.prevValue = ''
         this.resetOperation()
      }
   }

   const numberButtons = getAll('.cell_button.number')
   const operationButtons = getAll('.cell_button.operation')
   const computeButton = get('.cell_button.compute')
   const clearButton = get('.cell_button.clear')
   const allClearButton = get('.cell_button.all_clear')
   const display = get('.display')

   const calculator = new Calculator(display)

   numberButtons.forEach((button) => {
      button.addEventListener('click', () => {
         calculator.appendNumber(button.innerText)
         calculator.updateDisplay()
      })
   })
   operationButtons.forEach((button) => {
      button.addEventListener('click', () => {
         calculator.setOperation(button.innerText)
         calculator.updateDisplay()
      })
   })
   computeButton.addEventListener('click', () => {
      calculator.compute()
      calculator.updateDisplay()
   })
   clearButton.addEventListener('click', () => {
      calculator.clear()
      calculator.updateDisplay()
   })
   allClearButton.addEventListener('click', () => {
      calculator.reset()
      calculator.updateDisplay()
   })
})()

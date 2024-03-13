;(function () {
  'use strict'

  const get = function (target) {
    return document.querySelector(target)
  }

  const getAll = function (target) {
    return document.querySelectorAll(target)
  }

  const keys = Array.from(getAll('.key'))
  // 그대로 keys를 사용하지는 못함 (콘솔로 찍어보면 노드리스트라고 뜸 - 유사배열객체)
  // querySelectorAll을 사용할 경우 따로 배열로 바꾸어주어야 함 (Array.from 이용)

  console.log(keys)

  const soundsRoot = 'assets/sounds/'
  const drumSounds = [
    { key: 81, sound: 'clap.wav' },
    { key: 87, sound: 'crash.wav' },
    { key: 69, sound: 'hihat.wav' },
    { key: 65, sound: 'kick.wav' },
    { key: 83, sound: 'openhat.wav' },
    { key: 68, sound: 'ride.wav' },
    { key: 90, sound: 'shaker.wav' },
    { key: 88, sound: 'snare.wav' },
    { key: 67, sound: 'tom.wav' },
  ]

  // audio태그를 가진 요소를 만들어 key div에 삽입하는 함수
  const getAudioElement = (index) => {
    const audio = document.createElement('audio')
    audio.dataset.key = drumSounds[index].key
    audio.src = soundsRoot + drumSounds[index].sound
    return audio
  }

  // keycode를 받아 해당 keycode와 같은 audio 요소를 작동시키는 함수
  const playSound = (keycode) => {
    const $audio = get(`audio[data-key="${keycode}"]`)
    const $key = get(`div[data-key="${keycode}"]`)
    if ($audio && $key) {
      $key.classList.add('playing')
      $audio.currentTime = 0
      $audio.play()
    }
  }

  // keydown 이벤트를 받아 key마다 가지고 있는 keycode를 이용해 playSound()함수를 실행
  const onKeyDown = (e) => {
    console.log(e.keyCode) // 작동확인용 콘솔 찍기
    playSound(e.keyCode)
  }

  const onMouseDown = (e) => {
    const keycode = e.target.getAttribute('data-key')
    playSound(keycode)
  }

  const onTransitionEnd = (e) => {
    if (e.propertyName === 'transform') {
      // event의 propertyName이 'transform'이면 (event발생한 요소의 css 속성이)
      e.target.classList.remove('playing')
    }
  }

  const init = () => {
    window.addEventListener('keydown', onKeyDown)
    keys.forEach((key, index) => {
      const audio = getAudioElement(index)
      key.appendChild(audio)
      key.dataset.key = drumSounds[index].key
      key.addEventListener('click', onMouseDown)
      key.addEventListener('transitionend', onTransitionEnd)
      // 'transitionend'이벤트 : transition이 끝났을 때 뒤의 콜백함수를 실행시킬 수 있음
    })
  }

  init()
})()

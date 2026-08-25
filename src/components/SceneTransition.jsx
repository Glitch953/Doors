import { useRef } from 'react'

// Full-viewport fade used to hide the cut between the hallway and a
// destination scene, driven imperatively via a ref so it never needs to
// re-render React state at 60fps.
import { forwardRef, useImperativeHandle } from 'react'
import gsap from 'gsap'

const SceneTransition = forwardRef(function SceneTransition(_, ref) {
  const el = useRef(null)

  useImperativeHandle(ref, () => ({
    fadeOut: (duration = 0.9) =>
      new Promise((resolve) => {
        gsap.to(el.current, {
          opacity: 1,
          duration,
          ease: 'power2.inOut',
          onComplete: resolve,
        })
      }),
    fadeIn: (duration = 1.1) =>
      new Promise((resolve) => {
        gsap.to(el.current, {
          opacity: 0,
          duration,
          ease: 'power2.out',
          onComplete: resolve,
        })
      }),
  }))

  return <div ref={el} className="scene-transition" />
})

export default SceneTransition

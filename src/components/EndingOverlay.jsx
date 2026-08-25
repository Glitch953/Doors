import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function EndingOverlay({ visible, onReturn }) {
  const root = useRef(null)
  const l1 = useRef(null)
  const l2 = useRef(null)
  const l3 = useRef(null)
  const title = useRef(null)
  const btn = useRef(null)

  useEffect(() => {
    if (!visible) return
    const tl = gsap.timeline()
    tl.to(root.current, { opacity: 1, duration: 1.2, ease: 'power2.out' })
      .fromTo(l1.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1 }, '+=0.3')
      .fromTo(l2.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1 }, '+=0.7')
      .fromTo(l3.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 1.1 }, '+=0.7')
      .to([l1.current, l2.current, l3.current], { opacity: 0.35, duration: 1, delay: 1.2 })
      .fromTo(title.current, { opacity: 0, letterSpacing: '0.2em' }, { opacity: 1, letterSpacing: '0.5em', duration: 1.6 }, '-=0.3')
      .fromTo(btn.current, { opacity: 0 }, { opacity: 1, duration: 1 }, '-=0.4')
  }, [visible])

  if (!visible) return null

  return (
    <div ref={root} className="ending-text" style={{ pointerEvents: 'auto' }}>
      <div>
        <p ref={l1} style={{ opacity: 0 }}>Every door was a memory.</p>
        <p ref={l2} style={{ opacity: 0 }}>Every memory was a place.</p>
        <p ref={l3} style={{ opacity: 0 }}>And every place was home.</p>
      </div>
      <h1 ref={title} className="ui-label" style={{ opacity: 0 }}>DOORS</h1>
      <p className="ending-sub ui-label" style={{ opacity: 0.75 }}>Every door tells a story.</p>
      <button
        ref={btn}
        className="enter-btn"
        style={{ marginTop: '1.5rem', opacity: 0 }}
        onClick={onReturn}
      >
        RETURN TO THE HALLWAY
      </button>
    </div>
  )
}

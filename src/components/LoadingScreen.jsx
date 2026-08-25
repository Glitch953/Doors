import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useStory } from '../systems/StoryState'
import { AudioSystem } from '../systems/AudioSystem'

export default function LoadingScreen() {
  const view = useStory((s) => s.view)
  const setView = useStory((s) => s.setView)
  const enterExperience = useStory((s) => s.enterExperience)
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const taglineRef = useRef(null)
  const enterRef = useRef(null)
  const [ready, setReady] = useState(false)

  // loading -> intro
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 900)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    setView('intro')
    const tl = gsap.timeline()
    tl.fromTo(titleRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' })
      .fromTo(taglineRef.current, { opacity: 0 }, { opacity: 0.8, duration: 1.2, ease: 'power2.out' }, '-=0.6')
      .fromTo(enterRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, '-=0.4')
  }, [ready, setView])

  const handleEnter = () => {
    AudioSystem.unlock()
    useStory.getState().setAudioReady(true)
    const tl = gsap.timeline({
      onComplete: () => {
        enterExperience()
      },
    })
    tl.to([titleRef.current, taglineRef.current, enterRef.current], {
      opacity: 0,
      duration: 0.6,
      ease: 'power1.in',
    }).to(rootRef.current, { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, '-=0.2')
  }

  if (view === 'hallway' || view === 'transition' || (view && view !== 'loading' && view !== 'intro')) return null

  return (
    <div ref={rootRef} className="loading-screen">
      <div className="loading-inner">
        <h1 ref={titleRef} className="loading-title">DOORS</h1>
        <p ref={taglineRef} className="loading-tagline">Every door tells a story.</p>
        {ready && (
          <button ref={enterRef} className="enter-btn" onClick={handleEnter}>
            ENTER
          </button>
        )}
      </div>
      <div className="grain-overlay" />
    </div>
  )
}

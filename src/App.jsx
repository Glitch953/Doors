import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import './App.css'
import { EffectComposer, Bloom, Vignette, Noise, DepthOfField } from '@react-three/postprocessing'
import LoadingScreen from './components/LoadingScreen'
import SceneTransition from './components/SceneTransition'
import InteractionPrompt from './components/InteractionPrompt'
import AudioManager from './components/AudioManager'
import EndingOverlay from './components/EndingOverlay'
import Corridor from './components/Corridor'
import { useStory } from './systems/StoryState'

import MorningScene from './scenes/MorningScene'
import TrainScene from './scenes/TrainScene'
import ChildhoodScene from './scenes/ChildhoodScene'
import Room404Scene from './scenes/Room404Scene'
import HomeScene from './scenes/HomeScene'

const SCENES = {
  morning: MorningScene,
  train: TrainScene,
  childhood: ChildhoodScene,
  room404: Room404Scene,
  home: HomeScene,
}

const FOG = {
  hallway: ['#05040a', 6, 26],
  morning: ['#241a10', 8, 20],
  train: ['#0a0d12', 3, 15],
  childhood: ['#241d10', 8, 20],
  room404: ['#0c0d10', 6, 22],
  home: ['#100c08', 6, 22],
}

const isCoarsePointer =
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches

export default function App() {
  const view = useStory((s) => s.view)
  const audioReady = useStory((s) => s.audioReady)
  const visitDoor = useStory((s) => s.visitDoor)
  const setView = useStory((s) => s.setView)

  const [renderedScene, setRenderedScene] = useState('hallway')
  const [hint, setHint] = useState(null)
  const [caption, setCaption] = useState(null)
  const [busy, setBusy] = useState(false)
  const [ending, setEnding] = useState(false)
  const captionTimer = useRef(null)

  const showCaption = useCallback((text, duration = 4200) => {
    setCaption(text)
    clearTimeout(captionTimer.current)
    if (text) captionTimer.current = setTimeout(() => setCaption(null), duration)
  }, [])
  const transitionRef = useRef(null)

  const goToScene = useCallback(async (doorId) => {
    setBusy(true)
    setHint(null)
    await transitionRef.current.fadeOut()
    setRenderedScene(doorId)
    visitDoor(doorId)
    await new Promise((r) => setTimeout(r, 120))
    await transitionRef.current.fadeIn()
    setBusy(false)
  }, [visitDoor])

  const goToHallway = useCallback(async () => {
    setBusy(true)
    setEnding(false)
    await transitionRef.current.fadeOut()
    setRenderedScene('hallway')
    setView('hallway')
    await new Promise((r) => setTimeout(r, 120))
    await transitionRef.current.fadeIn()
    setBusy(false)
  }, [setView])

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' && renderedScene !== 'hallway' && !busy) goToHallway()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [renderedScene, busy, goToHallway])

  const showChrome = view !== 'loading' && view !== 'intro'
  const ActiveScene = SCENES[renderedScene]

  return (
    <div className="app-root">
      <Canvas
        shadows
        dpr={isCoarsePointer ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 55, near: 0.1, far: 60 }}
      >
        <color attach="background" args={['#050405']} />
        <fog attach="fog" args={FOG[renderedScene] || FOG.hallway} />
        <ambientLight intensity={0.18} color="#3a3550" />
        <hemisphereLight args={['#3a3550', '#0a0806', 0.25]} />

        <Suspense fallback={null}>
          {renderedScene === 'hallway' ? (
            <Corridor onDoorOpened={goToScene} onHint={setHint} />
          ) : (
            ActiveScene && (
              <ActiveScene
                onExit={goToHallway}
                onHint={setHint}
                onCaption={showCaption}
                onEnding={() => setEnding(true)}
              />
            )
          )}
        </Suspense>

        {!isCoarsePointer && (
          <EffectComposer multisampling={0}>
            <DepthOfField focusDistance={0.01} focalLength={0.035} bokehScale={2.4} height={480} />
            <Bloom luminanceThreshold={0.55} luminanceSmoothing={0.25} intensity={0.4} mipmapBlur />
            <Noise opacity={0.035} />
            <Vignette eskil={false} offset={0.25} darkness={0.9} />
          </EffectComposer>
        )}
      </Canvas>

      <LoadingScreen />

      {showChrome && (
        <>
          <div className="top-left-title ui-label">DOORS</div>
          <InteractionPrompt hint={hint} />
          {caption && <div className="story-caption">{caption}</div>}
          {renderedScene !== 'hallway' && (
            <button className="back-btn ui-label" onClick={() => !busy && goToHallway()}>
              ESC · BACK
            </button>
          )}
        </>
      )}

      <SceneTransition ref={transitionRef} />
      <AudioManager view={renderedScene} audioReady={audioReady} />
      <EndingOverlay visible={ending} onReturn={goToHallway} />
    </div>
  )
}

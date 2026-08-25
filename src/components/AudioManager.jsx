import { useEffect, useRef } from 'react'
import { AudioSystem } from '../systems/AudioSystem'

// Declaratively maps the current view to an ambience loop. One AudioManager
// instance lives at the App root for the lifetime of the experience.
export default function AudioManager({ view, audioReady }) {
  const current = useRef(null)

  useEffect(() => {
    if (!audioReady) return

    const map = {
      hallway: { type: 'room', volume: 0.05 },
      morning: { type: 'room', volume: 0.06 },
      train: { type: 'rain', volume: 0.16 },
      childhood: { type: 'room', volume: 0.05 },
      room404: { type: 'wind', volume: 0.05 },
      home: { type: 'room', volume: 0.04 },
    }

    const config = map[view]
    if (current.current && current.current !== view) {
      AudioSystem.stopLoop('ambience', 1)
    }
    if (config) {
      AudioSystem.startLoop('ambience', config)
      current.current = view
    }
  }, [view, audioReady])

  return null
}

import { useEffect, useRef, useState } from 'react'
import PlayerController from '../components/PlayerController'
import { DustMotes, Lamp, PictureFrame, RoomShell, Rug, Table, Window } from '../components/Furniture'
import { useStory } from '../systems/StoryState'
import { AudioSystem } from '../systems/AudioSystem'

// SCENE 5 -- HOME
// The quietest room in the experience. A photograph on the table ties every
// prior scene together, and the story resolves itself without another word
// of dialogue -- environmental storytelling carried all the way through.
export default function HomeScene({ onHint, onCaption, onEnding }) {
  const foundClue = useStory((s) => s.foundClue)
  const cluesFound = useStory((s) => s.cluesFound)
  const progress = useStory((s) => s.progress())
  const [settled, setSettled] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setTimeout(() => {
      setSettled(true)
      AudioSystem.stopLoop('ambience', 3)
      onCaption && onCaption('It grows quiet.', 3200)
      setTimeout(() => onEnding && onEnding(), 3600)
    }, 4500)
    return () => clearTimeout(timer.current)
  }, []) // eslint-disable-line

  return (
    <group>
      <PlayerController bounds={[-0.3, 0.6]} startZ={1.2} eyeHeight={1.55} surface="wood" enabled={!settled} />

      <directionalLight position={[1, 3, 2]} intensity={settled ? 0.4 : 0.9} color="#ffdca0" />

      <RoomShell size={[3.6, 2.5, 3.6]} floorColor="#3a3024" wallColor="#4a3f30" ceilingColor="#181410" />
      <Rug position={[0, 0, 0.3]} size={[1.6, 1]} color="#5c3b2e" />

      <Window position={[0, 1.35, -1.79]} size={[1, 1.1]} glowColor="#ffe3b0" intensity={settled ? 0.6 : 1.2} />

      <Lamp position={[-1.5, 1.6, -1.4]} intensity={settled ? 0.3 : 0.7} />

      <Table position={[0, 0, -0.6]} size={[0.6, 0.45, 0.5]} />

      {/* the final photograph -- connects every scene */}
      <group
        position={[0, 0.47, -0.6]}
        rotation={[-Math.PI / 2.6, 0, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!cluesFound.photograph) onHint && onHint('LOOK — PHOTOGRAPH')
        }}
        onClick={(e) => {
          e.stopPropagation()
          foundClue('photograph')
          onCaption &&
            onCaption(
              progress > 0.5
                ? 'Every room. Every door. All of it, one photograph, taken from right here.'
                : 'A photograph of this very room, taken a long time ago.'
            )
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.3, 0.02, 0.4]} />
          <meshStandardMaterial color="#1a140f" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.011, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.24, 0.34]} />
          <meshStandardMaterial color="#cbb98e" roughness={0.9} />
        </mesh>
      </group>

      <PictureFrame position={[-1.78, 1.3, 0.4]} rotationY={Math.PI / 2} color="#a99a76" />

      <DustMotes count={settled ? 15 : 30} area={[3, 1.9, 3]} />
    </group>
  )
}

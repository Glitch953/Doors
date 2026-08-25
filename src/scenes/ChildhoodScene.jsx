import { useState } from 'react'
import { Text } from '@react-three/drei'
import PlayerController from '../components/PlayerController'
import { Bed, DustMotes, PictureFrame, RoomShell, Rug, Table, Window } from '../components/Furniture'
import { useStory } from '../systems/StoryState'

// SCENE 3 -- 2012
// A nostalgic childhood bedroom. The photograph from Scene 1 turns out to
// belong here -- the first quiet thread tying the story together.
export default function ChildhoodScene({ onHint, onCaption }) {
  const foundClue = useStory((s) => s.foundClue)
  const cluesFound = useStory((s) => s.cluesFound)
  const visitedMorning = useStory((s) => s.visitedDoors.morning)
  const [calendarSeen, setCalendarSeen] = useState(false)

  return (
    <group>
      <PlayerController bounds={[-0.5, 0.5]} startZ={1.3} eyeHeight={1.35} surface="wood" />

      <directionalLight position={[-2, 3, 2]} intensity={1.3} color="#ffdca0" castShadow />

      <RoomShell size={[4, 2.5, 4]} floorColor="#4a3d28" wallColor="#5c4f34" ceilingColor="#1a1710" />
      <Rug position={[0, 0, 0.5]} size={[1.6, 1.1]} color="#3b5c6e" />

      <Window position={[0, 1.35, -1.99]} size={[1.1, 1.2]} glowColor="#ffe9bd" intensity={1.4} />

      <Bed position={[-0.7, 0, -0.5]} sheetColor="#8fa8c9" />

      {/* desk with old computer */}
      <Table position={[1.1, 0, -1.2]} size={[0.6, 0.4, 0.4]} />
      <mesh position={[1.1, 0.42, -1.3]} castShadow>
        <boxGeometry args={[0.32, 0.26, 0.3]} />
        <meshStandardMaterial color="#d8d3c4" roughness={0.6} />
      </mesh>
      <mesh position={[1.1, 0.42, -1.15]}>
        <planeGeometry args={[0.24, 0.18]} />
        <meshStandardMaterial color="#3c6d8f" emissive="#3c6d8f" emissiveIntensity={0.5} />
      </mesh>

      {/* toy box */}
      <mesh position={[-1.5, 0.16, 1]} rotation={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.32, 0.35]} />
        <meshStandardMaterial color="#a24b3c" roughness={0.85} />
      </mesh>

      {/* stack of books */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.9, 0.03 + i * 0.045, 1.3]} rotation={[0, i * 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.04, 0.22]} />
          <meshStandardMaterial color={['#4a6b52', '#7a4a3c', '#3c4a6b'][i]} roughness={0.9} />
        </mesh>
      ))}

      {/* calendar -- shows the year */}
      <group
        position={[1.98, 1.5, -0.4]}
        rotation={[0, -Math.PI / 2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHint && onHint('LOOK — CALENDAR')
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHint && onHint(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setCalendarSeen(true)
          foundClue('calendar')
          onCaption && onCaption('2012. The year everything still felt permanent.')
        }}
      >
        <mesh>
          <planeGeometry args={[0.3, 0.36]} />
          <meshStandardMaterial color="#e9e2ce" roughness={0.9} />
        </mesh>
        <Text position={[0, 0.08, 0.01]} fontSize={0.09} color="#2a2216" anchorX="center">
          2012
        </Text>
      </group>

      {/* the connected photograph */}
      <PictureFrame
        position={[-1.98, 1.4, 0.3]}
        rotationY={Math.PI / 2}
        color="#cbb98e"
        glow={visitedMorning && !cluesFound.photograph}
        onClick={(e) => {
          e.stopPropagation()
          foundClue('photograph')
          onCaption &&
            onCaption(
              visitedMorning
                ? "It's the same room. The same bed. Somehow the photograph from the other door was taken right here."
                : 'A photograph, faded. Somewhere, another version of this room is waiting to be found.'
            )
        }}
      />

      <DustMotes count={35} area={[3.4, 1.9, 3.4]} />
    </group>
  )
}

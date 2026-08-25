import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import PlayerController from '../components/PlayerController'
import { Bed, DustMotes, PictureFrame, RoomShell, Rug, Table, Window } from '../components/Furniture'
import { useStory } from '../systems/StoryState'

// SCENE 1 -- 06:42
// A quiet bedroom, the very start of the story. Environmental storytelling:
// an alarm clock frozen at the same time as the door label, a coffee going
// cold, a packed backpack by the door -- someone was about to leave.
export default function MorningScene({ onHint, onCaption }) {
  const foundClue = useStory((s) => s.foundClue)
  const cluesFound = useStory((s) => s.cluesFound)
  const [clockLit, setClockLit] = useState(true)
  const clockGlow = useRef()

  useFrame(({ clock }) => {
    if (clockGlow.current) {
      clockGlow.current.emissiveIntensity = clockLit ? 0.9 + Math.sin(clock.getElapsedTime() * 2) * 0.05 : 0.1
    }
  })

  return (
    <group>
      <PlayerController bounds={[-0.6, 0.6]} startZ={1.6} eyeHeight={1.55} surface="wood" />

      <directionalLight
        position={[3, 3.4, -1]}
        intensity={1.4}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      <RoomShell size={[4.4, 2.6, 4.4]} floorColor="#3a2f22" wallColor="#4a3d2c" ceilingColor="#171310" />
      <Rug position={[0, 0, 0.6]} size={[2, 1.3]} color="#5c3b2e" />

      <Window position={[0, 1.5, -2.19]} size={[1.3, 1.4]} glowColor="#ffe3b0" intensity={1.6} />

      <Bed position={[-0.9, 0, -0.6]} rotationY={0} />

      <Table position={[0.55, 0, -1.1]} size={[0.45, 0.42, 0.45]} />
      {/* alarm clock */}
      <group
        position={[0.55, 0.44, -1.1]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHint && onHint('LOOK — ALARM CLOCK')
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHint && onHint(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          setClockLit((v) => !v)
          onCaption && onCaption('06:42. It never moves past that. As if the morning froze here.')
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.18, 0.1, 0.08]} />
          <meshStandardMaterial color="#141210" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.041]}>
          <planeGeometry args={[0.13, 0.05]} />
          <meshStandardMaterial ref={clockGlow} color="#ff6a3c" emissive="#ff6a3c" emissiveIntensity={0.9} />
        </mesh>
        <Text position={[0, 0, 0.045]} fontSize={0.035} color="#1a0d05" anchorX="center" anchorY="middle">
          06:42
        </Text>
      </group>

      {/* coffee cup */}
      <mesh position={[0.68, 0.47, -0.98]} castShadow>
        <cylinderGeometry args={[0.035, 0.03, 0.05, 16]} />
        <meshStandardMaterial color="#e9e2d2" roughness={0.4} />
      </mesh>

      {/* backpack by the door */}
      <mesh position={[1.3, 0.18, 1.4]} rotation={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.32, 0.38, 0.16]} />
        <meshStandardMaterial color="#3f5142" roughness={0.9} />
      </mesh>

      {/* clothing draped over a chair */}
      <mesh position={[-1.6, 0.35, 0.9]} rotation={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.34, 0.06, 0.3]} />
        <meshStandardMaterial color="#6b5b6e" roughness={1} />
      </mesh>

      {/* photograph -- the key story clue */}
      <PictureFrame
        position={[-2.14, 1.5, -0.2]}
        rotationY={Math.PI / 2}
        color="#c7b78f"
        glow={!cluesFound.photograph}
        onClick={(e) => {
          e.stopPropagation()
          foundClue('photograph')
          onCaption &&
            onCaption('A photograph of a small bedroom, another time entirely. Somehow it feels familiar.')
        }}
      />

      <DustMotes count={40} area={[3.6, 2, 3.6]} />
    </group>
  )
}

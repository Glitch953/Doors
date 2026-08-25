import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera, RenderTexture } from '@react-three/drei'
import PlayerController from '../components/PlayerController'
import { Bed, DustMotes, Lamp, RoomShell, Table, Window } from '../components/Furniture'
import { useStory } from '../systems/StoryState'

// A miniature, slightly-wrong version of the opening hallway, rendered into
// a texture and used as the mirror's "reflection". Colder light, a subtly
// different geometry rhythm -- close enough to be recognizable, wrong
// enough to be unsettling.
function GhostHallway() {
  const group = useRef()
  useFrame(({ clock }) => {
    if (group.current) group.current.position.x = Math.sin(clock.getElapsedTime() * 0.15) * 0.05
  })
  return (
    <group ref={group}>
      <PerspectiveCamera makeDefault position={[0, 1.6, 4]} fov={60} />
      <color attach="background" args={['#0a0c14']} />
      <fog attach="fog" args={['#0a0c14', 2, 12]} />
      <ambientLight intensity={0.2} color="#5c6cff" />
      <pointLight position={[0, 2, 1]} intensity={0.8} color="#8fa0ff" />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[3.4, 14]} />
        <meshStandardMaterial color="#0c0e16" roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[-1.7, 1.2, -3]}>
        <boxGeometry args={[0.1, 2.4, 14]} />
        <meshStandardMaterial color="#151a26" roughness={0.8} />
      </mesh>
      <mesh position={[1.7, 1.2, -3]}>
        <boxGeometry args={[0.1, 2.4, 14]} />
        <meshStandardMaterial color="#12151f" roughness={0.8} />
      </mesh>

      {[0, -3, -6].map((z, i) => (
        <mesh key={i} position={[-1.6, 1.1, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 1.8]} />
          <meshStandardMaterial
            color="#3a4a8f"
            emissive="#5c6cff"
            emissiveIntensity={0.5 + i * 0.15}
            side={2}
          />
        </mesh>
      ))}

      {/* a lone figure-shaped silhouette, far down the ghost hallway */}
      <mesh position={[0, 0.9, -9]}>
        <capsuleGeometry args={[0.22, 1.1, 4, 8]} />
        <meshStandardMaterial color="#04050a" roughness={1} />
      </mesh>
    </group>
  )
}

// SCENE 4 -- ROOM 404
// A completely ordinary hotel room, until the mirror shows the hallway from
// the very beginning of the experience instead of the room itself.
export default function Room404Scene({ onHint, onCaption }) {
  const foundClue = useStory((s) => s.foundClue)
  const cluesFound = useStory((s) => s.cluesFound)
  const [nearMirror, setNearMirror] = useState(false)

  return (
    <group>
      <PlayerController
        bounds={[-0.2, 1.6]}
        startZ={1.6}
        eyeHeight={1.6}
        surface="wood"
        onZChange={(z) => setNearMirror(z < 0.9)}
      />

      <directionalLight position={[2, 3, -1]} intensity={0.7} color="#bcd0e6" />

      <RoomShell size={[4.2, 2.7, 4.6]} floorColor="#2f2b28" wallColor="#3f3a36" ceilingColor="#161412" />

      <Window position={[1.9, 1.5, -0.5]} rotationY={-Math.PI / 2} size={[1.3, 1.3]} glowColor="#7f95b0" intensity={1} />

      <Bed position={[-1, 0, -0.9]} sheetColor="#c7bfae" />
      <Table position={[1.2, 0, -1.7]} size={[0.5, 0.42, 0.4]} />
      <Lamp position={[1.2, 0.42, -1.7]} color="#ffdca0" intensity={0.6} />

      {/* the mirror */}
      <group
        position={[0, 1.35, -2.28]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHint && onHint('LOOK INTO THE MIRROR')
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHint && onHint(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (!cluesFound.mirror) {
            foundClue('mirror')
            onCaption &&
              onCaption(
                "That isn't this room. That's the hallway. The one from the very beginning — only colder, and further away."
              )
          }
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[1.1, 1.6, 0.06]} />
          <meshStandardMaterial color="#141210" roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[0.94, 1.44]} />
          <meshBasicMaterial toneMapped={false}>
            <RenderTexture attach="map" width={nearMirror ? 512 : 128} height={nearMirror ? 768 : 192}>
              <GhostHallway />
            </RenderTexture>
          </meshBasicMaterial>
        </mesh>
      </group>

      <DustMotes count={30} area={[3.8, 2.2, 4]} />
    </group>
  )
}

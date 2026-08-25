import { useRef, useState } from 'react'
import { ContactShadows } from '@react-three/drei'
import PlayerController from './PlayerController'
import Door from './Door'
import { DustMotes, Lamp, PictureFrame, Rug } from './Furniture'
import { DOORS, useStory } from '../systems/StoryState'

const HALLWAY_LENGTH = 26
const START_Z = 5
const END_Z = -19

// Door positions along the left wall of the hallway, evenly spaced.
const DOOR_Z = [1, -3.5, -8, -12.5, -17]

export default function Corridor({ onDoorOpened, onHint }) {
  const playerZRef = useRef(START_Z)
  const [disabled, setDisabled] = useState(false)
  const visitedDoors = useStory((s) => s.visitedDoors)

  const handleProximity = (id) => {
    if (!onHint) return
    if (!id) return onHint(null)
    const door = DOORS.find((d) => d.id === id)
    onHint(door ? door.label : null)
  }

  const handleOpen = (id) => {
    setDisabled(true)
    onDoorOpened && onDoorOpened(id)
  }

  return (
    <group>
      <PlayerController
        bounds={[END_Z, START_Z]}
        startZ={START_Z}
        onZChange={(z) => (playerZRef.current = z)}
        enabled={!disabled}
      />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, START_Z - HALLWAY_LENGTH / 2 + 3]} receiveShadow>
        <planeGeometry args={[4.8, HALLWAY_LENGTH + 10]} />
        <meshStandardMaterial color="#1c1712" roughness={0.75} metalness={0.08} />
      </mesh>

      {/* runner rug down the center */}
      {DOOR_Z.map((z, i) => (
        <Rug key={i} position={[0.4, 0, z + 1.2]} size={[1.4, 2.2]} color="#5b2b28" />
      ))}

      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.85, START_Z - HALLWAY_LENGTH / 2 + 3]}>
        <planeGeometry args={[4.8, HALLWAY_LENGTH + 10]} />
        <meshStandardMaterial color="#0f0d0a" roughness={0.9} />
      </mesh>

      {/* left wall (with doors) */}
      <mesh position={[-2.4, 1.4, START_Z - HALLWAY_LENGTH / 2 + 3]} receiveShadow>
        <boxGeometry args={[0.1, 2.85, HALLWAY_LENGTH + 10]} />
        <meshStandardMaterial color="#2a221a" roughness={0.9} />
      </mesh>

      {/* right wall */}
      <mesh position={[2.4, 1.4, START_Z - HALLWAY_LENGTH / 2 + 3]} receiveShadow>
        <boxGeometry args={[0.1, 2.85, HALLWAY_LENGTH + 10]} />
        <meshStandardMaterial color="#241d16" roughness={0.9} />
      </mesh>

      {/* far end wall */}
      <mesh position={[0, 1.4, END_Z - 1]}>
        <boxGeometry args={[4.9, 2.85, 0.1]} />
        <meshStandardMaterial color="#171310" roughness={0.9} />
      </mesh>

      {/* wall lamps + picture frames between doors */}
      {DOOR_Z.map((z, i) => (
        <group key={i}>
          <Lamp position={[2.25, 1.9, z + 2]} intensity={0.7} />
          <PictureFrame position={[2.25, 1.5, z - 0.3]} rotationY={-Math.PI / 2} />
        </group>
      ))}

      <DustMotes count={70} area={[4, 2.6, HALLWAY_LENGTH + 6]} />

      <ContactShadows position={[0, 0.01, START_Z - HALLWAY_LENGTH / 2]} opacity={0.4} scale={30} blur={2} far={3} />

      {DOORS.map((d, i) => (
        <Door
          key={d.id}
          id={d.id}
          label={d.label}
          position={[-2.35, 0, DOOR_Z[i]]}
          rotationY={Math.PI / 2}
          visited={visitedDoors[d.id]}
          onOpen={handleOpen}
          onProximity={handleProximity}
          playerZRef={playerZRef}
          disabled={disabled}
        />
      ))}
    </group>
  )
}

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import PlayerController from '../components/PlayerController'
import { Lamp } from '../components/Furniture'
import { useStory } from '../systems/StoryState'

function Rain({ count = 220 }) {
  const points = useRef()
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, (_, i) => {
        const axis = i % 3
        if (axis === 0) return (Math.random() - 0.5) * 10
        if (axis === 1) return Math.random() * 5
        return (Math.random() - 0.5) * 14
      })
    )
  )
  useFrame((_, delta) => {
    const arr = points.current.geometry.attributes.position.array
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] -= delta * 6
      if (arr[i] < 0) arr[i] = 5
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8fa4b8" size={0.02} transparent opacity={0.45} depthWrite={false} />
    </points>
  )
}

// SCENE 2 -- LAST TRAIN
// A rain-soaked platform at night. Lonely, cinematic, one clue: an
// abandoned suitcase nobody came back for.
export default function TrainScene({ onHint, onCaption }) {
  const foundClue = useStory((s) => s.foundClue)
  const cluesFound = useStory((s) => s.cluesFound)

  return (
    <group>
      <PlayerController bounds={[-3, 3]} startZ={1} eyeHeight={1.6} surface="wet" />

      <ambientLight intensity={0.1} color="#3a4a5c" />
      <directionalLight position={[-4, 5, 2]} intensity={0.15} color="#5c7a9c" />

      {/* wet platform floor -- reflective */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 16]} />
        <meshStandardMaterial color="#14181c" roughness={0.15} metalness={0.4} />
      </mesh>

      {/* platform edge + tracks */}
      <mesh position={[3.4, -0.05, 0]}>
        <boxGeometry args={[0.6, 0.1, 16]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {[...Array(10)].map((_, i) => (
        <mesh key={i} position={[3.8, -0.02, -7 + i * 1.6]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.12]} />
          <meshStandardMaterial color="#2c2620" roughness={0.9} />
        </mesh>
      ))}

      {/* train silhouette, half in shadow */}
      <group position={[5.2, 0, 0]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[1.6, 2.2, 15]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.3} />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[-0.82, 1.3, -6 + i * 2.2]}>
            <planeGeometry args={[0.05, 0.6]} />
            <meshStandardMaterial
              color="#ffdf9e"
              emissive="#ffdf9e"
              emissiveIntensity={i % 2 === 0 ? 0.8 : 0.1}
            />
          </mesh>
        ))}
      </group>

      {/* station lamps */}
      <Lamp position={[-1.2, 2.4, -3]} color="#dfe9ff" intensity={1.1} />
      <Lamp position={[-1.2, 2.4, 2]} color="#dfe9ff" intensity={1.1} />

      {/* bench */}
      <mesh position={[-1.6, 0.22, -1]} castShadow>
        <boxGeometry args={[1, 0.06, 0.4]} />
        <meshStandardMaterial color="#2a2620" roughness={0.85} />
      </mesh>
      <mesh position={[-1.6, 0.11, -1.18]} castShadow>
        <boxGeometry args={[1, 0.22, 0.04]} />
        <meshStandardMaterial color="#211d18" roughness={0.85} />
      </mesh>

      {/* platform sign */}
      <Text position={[-1.6, 2.9, -1]} fontSize={0.14} color="#dfe9ff" anchorX="center">
        PLATFORM 3
      </Text>

      {/* abandoned suitcase -- the clue */}
      <group
        position={[-1.3, 0.14, -0.55]}
        rotation={[0, 0.5, 0]}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHint && onHint('LOOK — SUITCASE')
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHint && onHint(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          foundClue('suitcase')
          onCaption &&
            onCaption('Nobody came back for it. Just like nobody came back for that morning.')
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.2, 0.18]} />
          <meshStandardMaterial
            color="#5c4632"
            roughness={0.7}
            emissive={cluesFound.suitcase ? '#000000' : '#caa869'}
            emissiveIntensity={cluesFound.suitcase ? 0 : 0.12}
          />
        </mesh>
      </group>

      <Rain />
    </group>
  )
}

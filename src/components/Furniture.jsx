import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Reusable low-poly-but-believable furniture pieces shared across scenes.
// Kept deliberately simple geometry, with material quality (roughness,
// subtle color variation) doing the work of selling realism.

export function Bed({ position = [0, 0, 0], rotationY = 0, sheetColor = '#cfc6b4' }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.32, 2.1]} />
        <meshStandardMaterial color="#3b2f24" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.46, 0.18, 2.05]} />
        <meshStandardMaterial color={sheetColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.62, -0.85]} castShadow>
        <boxGeometry args={[1.3, 0.16, 0.34]} />
        <meshStandardMaterial color="#e6ddc9" roughness={1} />
      </mesh>
      <mesh position={[0, 0.85, -1.0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.08]} />
        <meshStandardMaterial color="#2a2118" roughness={0.7} />
      </mesh>
    </group>
  )
}

export function Table({ position = [0, 0, 0], size = [0.55, 0.5, 0.55], color = '#3a2b1f' }) {
  const [w, h, d] = size
  return (
    <group position={position}>
      <mesh position={[0, h, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.04, d]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.05} />
      </mesh>
      {[
        [w / 2 - 0.04, d / 2 - 0.04],
        [-w / 2 + 0.04, d / 2 - 0.04],
        [w / 2 - 0.04, -d / 2 + 0.04],
        [-w / 2 + 0.04, -d / 2 + 0.04],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, h / 2, z]} castShadow>
          <boxGeometry args={[0.04, h, 0.04]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function Lamp({ position = [0, 0, 0], on = true, color = '#ffcf8a', intensity = 0.9 }) {
  const light = useRef()
  useFrame(({ clock }) => {
    if (!light.current) return
    const flicker = 1 + Math.sin(clock.getElapsedTime() * 7.3) * 0.015
    light.current.intensity = on ? intensity * flicker : 0
  })
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.32, 8]} />
        <meshStandardMaterial color="#1c1712" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <coneGeometry args={[0.14, 0.16, 16, 1, true]} />
        <meshStandardMaterial color="#e8d9b0" roughness={0.6} side={2} emissive={on ? color : '#000'} emissiveIntensity={on ? 0.4 : 0} />
      </mesh>
      <pointLight ref={light} position={[0, 0.2, 0]} color={color} distance={4} intensity={intensity} />
    </group>
  )
}

export function Rug({ position = [0, 0, 0], size = [2.2, 1.5], color = '#7a3b34' }) {
  return (
    <mesh position={[position[0], 0.011, position[2]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}

export function Window({ position = [0, 1.4, 0], rotationY = 0, size = [1.2, 1.4], glowColor = '#bcd4e6', intensity = 1.1 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[size[0] + 0.14, size[1] + 0.14, 0.08]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color={glowColor} emissive={glowColor} emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[0.03, size[1], 0.01]} />
        <meshStandardMaterial color="#efe9dc" />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <boxGeometry args={[size[0], 0.03, 0.01]} />
        <meshStandardMaterial color="#efe9dc" />
      </mesh>
      <pointLight position={[0, 0, 0.6]} color={glowColor} intensity={intensity} distance={5} />
    </group>
  )
}

export function PictureFrame({ position, rotationY = 0, color = '#8a7a5c', onClick, glow = false }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={onClick}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.44, 0.02]} />
        <meshStandardMaterial color="#1a140f" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.28, 0.38]} />
        <meshStandardMaterial
          color={color}
          emissive={glow ? '#caa869' : '#000000'}
          emissiveIntensity={glow ? 0.4 : 0}
          roughness={0.9}
        />
      </mesh>
    </group>
  )
}

export function DustMotes({ count = 60, area = [6, 3, 20] }) {
  const points = useRef()
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, (_, i) => {
        const axis = i % 3
        const span = area[axis]
        return (Math.random() - 0.5) * span
      })
    )
  )
  useFrame((_, delta) => {
    if (!points.current) return
    const arr = points.current.geometry.attributes.position.array
    for (let i = 1; i < arr.length; i += 3) {
      arr[i] += delta * 0.03
      if (arr[i] > area[1] / 2) arr[i] = -area[1] / 2
    }
    points.current.geometry.attributes.position.needsUpdate = true
  })
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d8cba0" size={0.012} transparent opacity={0.35} depthWrite={false} />
    </points>
  )
}

export function RoomShell({ size = [5, 2.8, 5], floorColor = '#2a231a', wallColor = '#3a3126', ceilingColor = '#141210' }) {
  const [w, h, d] = size
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={floorColor} roughness={0.85} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.95} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <boxGeometry args={[w, h, 0.1]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[d, h, 0.1]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[d, h, 0.1]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

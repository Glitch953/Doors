import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import gsap from 'gsap'
import { AudioSystem } from '../systems/AudioSystem'

// A physical door embedded in the corridor wall. The label is a carved
// plate on the door itself rather than a UI button, per the brief.
export default function Door({
  id,
  position = [0, 0, 0],
  rotationY = 0,
  label = 'DOOR',
  visited = false,
  onOpen,
  onProximity,
  playerZRef,
  disabled = false,
  threshold = 3.2,
}) {
  const doorMesh = useRef()
  const handle = useRef()
  const frameGlow = useRef()
  const [hovered, setHovered] = useState(false)
  const nearRef = useRef(false)
  const openedRef = useRef(false)

  useFrame(() => {
    const z = playerZRef?.current ?? 999
    const distance = Math.abs(z - position[2])
    const wasNear = nearRef.current
    nearRef.current = distance < threshold
    if (nearRef.current !== wasNear && onProximity) {
      onProximity(nearRef.current ? id : null)
    }
    const targetGlow = hovered && nearRef.current && !disabled ? 0.95 : 0.12
    if (frameGlow.current) {
      frameGlow.current.material.emissiveIntensity +=
        (targetGlow - frameGlow.current.material.emissiveIntensity) * 0.08
    }
  })

  const handleClick = (e) => {
    e.stopPropagation()
    if (disabled || openedRef.current || !nearRef.current) return
    openedRef.current = true
    AudioSystem.doorHandle()

    gsap.to(handle.current.rotation, { z: -0.9, duration: 0.35, ease: 'power2.out' })
    gsap.to(doorMesh.current.rotation, {
      y: -Math.PI * 0.62,
      duration: 1.3,
      delay: 0.15,
      ease: 'power2.inOut',
      onStart: () => AudioSystem.doorOpen(),
      onComplete: () => {
        onOpen && onOpen(id)
      },
    })
  }

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* frame */}
      <mesh position={[0, 1.15, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.28, 2.32, 0.09]} />
        <meshStandardMaterial color="#1b1610" roughness={0.85} metalness={0.05} />
      </mesh>

      {/* subtle hover / proximity highlight, not neon */}
      <mesh ref={frameGlow} position={[0, 1.15, 0.01]}>
        <boxGeometry args={[1.16, 2.18, 0.02]} />
        <meshStandardMaterial
          color="#caa869"
          emissive="#caa869"
          emissiveIntensity={0.12}
          roughness={0.6}
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* door leaf, pivoted at the left edge */}
      <group position={[-0.55, 0, 0]}>
        <mesh
          ref={doorMesh}
          position={[0.55, 1.15, 0]}
          castShadow
          receiveShadow
          onPointerOver={(e) => {
            e.stopPropagation()
            if (!disabled && nearRef.current) setHovered(true)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHovered(false)
          }}
          onClick={handleClick}
        >
          <boxGeometry args={[1.1, 2.15, 0.06]} />
          <meshStandardMaterial color={visited ? '#2b241c' : '#3a2f22'} roughness={0.55} metalness={0.15} />

          <group ref={handle} position={[0.42, 0, 0.05]}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.16, 12]} />
              <meshStandardMaterial color="#c9ad7a" metalness={0.9} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0, -0.03]}>
              <sphereGeometry args={[0.03, 12, 12]} />
              <meshStandardMaterial color="#c9ad7a" metalness={0.9} roughness={0.25} />
            </mesh>
          </group>

          <Text
            position={[0, 0.55, 0.035]}
            fontSize={0.09}
            color="#d8c9a3"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.12}
          >
            {label}
          </Text>
        </mesh>
      </group>

      <pointLight position={[0, 2.05, 0.4]} intensity={hovered ? 1.1 : 0.35} distance={2.6} color="#e7c98f" />
    </group>
  )
}

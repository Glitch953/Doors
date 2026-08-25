import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AudioSystem } from '../systems/AudioSystem'

// Cinematic first-person rig: smooth, eased forward/back travel along the Z
// axis (never a raw FPS strafe), a small clamped look-around driven by
// pointer drag, and gentle idle sway so the camera never feels static.
//
// Deliberately NOT pointer-lock: the brief asks for "comfortable and
// cinematic" movement, not a shooter-style mouse-look.
export default function PlayerController({
  bounds = [-11, 5],
  startZ = 3.2,
  eyeHeight = 1.62,
  onZChange,
  surface = 'wood',
  enabled = true,
}) {
  const { camera, gl } = useThree()
  const zRef = useRef(startZ)
  const velRef = useRef(0)
  const keys = useRef({})
  const yaw = useRef(0)
  const pitch = useRef(0)
  const targetYaw = useRef(0)
  const targetPitch = useRef(0)
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const stepTimer = useRef(0)
  const swayT = useRef(Math.random() * 10)

  useEffect(() => {
    camera.position.set(0, eyeHeight, startZ)
    zRef.current = startZ
  }, []) // eslint-disable-line

  useEffect(() => {
    const down = (e) => (keys.current[e.code] = true)
    const up = (e) => (keys.current[e.code] = false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    const el = gl.domElement
    const onPointerDown = (e) => {
      dragging.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
    }
    const onPointerUp = () => (dragging.current = false)
    const onPointerMove = (e) => {
      if (!dragging.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }
      targetYaw.current -= dx * 0.0022
      targetPitch.current -= dy * 0.0018
      targetPitch.current = Math.max(-0.28, Math.min(0.28, targetPitch.current))
      targetYaw.current = Math.max(-0.55, Math.min(0.55, targetYaw.current))
    }
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointermove', onPointerMove)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [gl])

  useFrame((_, delta) => {
    if (!enabled) return
    const forward =
      (keys.current['KeyW'] || keys.current['ArrowUp'] ? 1 : 0) -
      (keys.current['KeyS'] || keys.current['ArrowDown'] ? 1 : 0)

    const targetVel = forward * 1.35
    velRef.current += (targetVel - velRef.current) * Math.min(1, delta * 4)

    if (Math.abs(velRef.current) > 0.02) {
      zRef.current -= velRef.current * delta
      zRef.current = Math.max(bounds[0], Math.min(bounds[1], zRef.current))
      stepTimer.current += delta
      const interval = 0.42
      if (stepTimer.current > interval) {
        stepTimer.current = 0
        AudioSystem.footstep(surface)
      }
    }

    yaw.current += (targetYaw.current - yaw.current) * Math.min(1, delta * 5)
    pitch.current += (targetPitch.current - pitch.current) * Math.min(1, delta * 5)

    swayT.current += delta
    const swayY = Math.sin(swayT.current * 0.9) * 0.012
    const swayX = Math.sin(swayT.current * 0.55) * 0.008

    camera.position.z = zRef.current
    camera.position.y = eyeHeight + swayY
    camera.position.x = swayX
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')

    if (onZChange) onZChange(zRef.current)
  })

  return null
}

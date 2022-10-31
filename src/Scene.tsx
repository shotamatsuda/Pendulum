import { styled } from '@mui/material'
import {
  Box,
  OrbitControls,
  PerspectiveCamera,
  Plane,
  softShadows,
  useTexture
} from '@react-three/drei'
import { Canvas, MeshProps } from '@react-three/fiber'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import {
  MotionValue,
  useIsomorphicLayoutEffect,
  useSpring,
  useTransform
} from 'framer-motion'
import { motion } from 'framer-motion-3d'
import { useAtomValue } from 'jotai'
import { BlendFunction } from 'postprocessing'
import React, {
  ComponentPropsWithRef,
  Suspense,
  forwardRef,
  useCallback,
  useEffect,
  useState
} from 'react'
import { MOUSE, PerspectiveCamera as PerspectiveCameraImpl, TOUCH } from 'three'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

import { paramsStore, stateStore } from './stores'
import { SceneEventHandlers } from './useSceneEventHandlers'

softShadows()

const Root = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%'
})

interface PendulumProps extends Omit<MeshProps, 'args'> {
  angle: MotionValue<number>
  length: MotionValue<number>
  bobRadius?: number
  armRadius?: number
  pivotRadius?: number
  pivotLength?: number
}

const Pendulum: React.FC<PendulumProps> = ({
  angle,
  length,
  bobRadius = 0.6,
  armRadius = 0.04,
  pivotRadius = 0.1,
  pivotLength = 2,
  ...props
}) => {
  const groupY = useTransform(length, length => length + 2)
  const armY = useTransform(length, length => -length / 2 + bobRadius / 2)
  const armScaleY = useTransform(length, length => length - bobRadius)
  const bobY = useTransform(length, length => -length + 0.5)

  const matcap = useTexture(
    'https://raw.githubusercontent.com/spite/spherical-environment-mapping/master/matcap2.jpg'
  )
  return (
    <motion.group position-y={groupY} position-z={pivotLength}>
      <motion.group rotation-z={angle}>
        <motion.mesh position-y={armY} scale-y={armScaleY} castShadow>
          <cylinderGeometry
            args={[armRadius, armRadius, 1, 32]}
            attach='geometry'
          />
          <meshMatcapMaterial matcap={matcap} />
        </motion.mesh>
        <motion.mesh position-y={bobY} castShadow receiveShadow>
          <sphereGeometry args={[bobRadius, 32, 32]} attach='geometry' />
          <meshMatcapMaterial matcap={matcap} />
        </motion.mesh>
      </motion.group>
      <mesh
        position={[0, 0, -(pivotLength - 0.2) / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry
          args={[pivotRadius, pivotRadius, pivotLength + 0.2, 32]}
          attach='geometry'
        />
        <meshMatcapMaterial matcap={matcap} />
      </mesh>
      <Plane args={[1000, 1000]} {...props}>
        <meshBasicMaterial visible={false} />
      </Plane>
    </motion.group>
  )
}

const Structure: React.FC = () => {
  const Floor = useCallback(
    (props: Omit<MeshProps, 'args'>) => (
      <Box
        args={[5000, 1000, 10]}
        position={[0, -5, 500]}
        rotation={[-Math.PI / 2, 0, 0]}
        {...props}
      />
    ),
    []
  )
  const Wall = useCallback(
    (props: Omit<MeshProps, 'args'>) => (
      <Box args={[5000, 1000, 10]} position={[0, 500, -5]} {...props} />
    ),
    []
  )
  return (
    <>
      <Floor>
        <meshStandardMaterial color={0xf8f8f6} />
      </Floor>
      <Wall>
        <meshStandardMaterial color={0xf8f8f6} />
      </Wall>
      <Floor receiveShadow>
        <shadowMaterial color={0x007a88} transparent opacity={0.3} />
      </Floor>
      <Wall receiveShadow>
        <shadowMaterial color={0x007a88} transparent opacity={0.3} />
      </Wall>
    </>
  )
}

const Lights: React.FC = () => (
  <>
    <ambientLight intensity={0.3} />
    <pointLight intensity={0.4} position={[0, 10, 5]} />
    <directionalLight
      position={[40, 100, 40]}
      intensity={2}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-near={0}
      shadow-camera-far={500}
      shadow-camera-left={-30}
      shadow-camera-right={30}
      shadow-camera-top={40}
      shadow-camera-bottom={-10}
    />
  </>
)

export interface SceneProps
  extends Omit<ComponentPropsWithRef<typeof Root>, keyof SceneEventHandlers>,
    Partial<SceneEventHandlers> {}

export const Scene = forwardRef<HTMLDivElement, SceneProps>(
  ({ onPointerMove, onPointerDown, ...props }, forwardedRef) => {
    const params = useAtomValue(paramsStore)
    const state = useAtomValue(stateStore)

    const length: MotionValue<number> = useSpring(params.length)
    useEffect(() => {
      length.set(params.length)
    }, [params.length, length])

    const [camera, setCamera] = useState<PerspectiveCameraImpl | null>(null)
    const [controls, setControls] = useState<OrbitControlsImpl | null>(null)
    const updateCamera = useCallback(
      (length: number) => {
        if (camera == null || controls == null) {
          return
        }
        // Track pendulum.
        controls.target.y = length / 2 + 1.25
        camera.zoom = (1 / (length + 2)) * 50
        camera.updateProjectionMatrix()
        controls.update()
      },
      [camera, controls]
    )

    useIsomorphicLayoutEffect(() => {
      if (camera != null && controls != null) {
        updateCamera(length.get())
      }
    }, [length, camera, controls, updateCamera])

    useIsomorphicLayoutEffect(() => {
      return length.onChange(length => {
        updateCamera(length)
      })
    }, [length, updateCamera])

    const angle = useTransform(state, ({ angle }) => angle)

    return (
      <Root ref={forwardedRef} {...props}>
        <Canvas shadows style={{ position: 'absolute' }}>
          <PerspectiveCamera
            ref={setCamera}
            makeDefault
            position={[-20, 30, 60]}
            near={10}
            far={5000}
          />
          <OrbitControls
            ref={setControls}
            mouseButtons={{
              LEFT: MOUSE.PAN,
              MIDDLE: MOUSE.DOLLY,
              RIGHT: MOUSE.ROTATE
            }}
            touches={{
              ONE: TOUCH.PAN,
              TWO: TOUCH.DOLLY_ROTATE
            }}
            enablePan={false}
            enableZoom={false}
            minAzimuthAngle={-Math.PI / 4}
            maxAzimuthAngle={Math.PI / 4}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
          <Lights />
          <Structure />
          <Suspense fallback={null}>
            <Pendulum
              angle={angle}
              length={length}
              onPointerMove={onPointerMove}
              onPointerDown={onPointerDown}
            />
          </Suspense>
          <EffectComposer>
            <Noise blendFunction={BlendFunction.MULTIPLY} opacity={0.1} />
          </EffectComposer>
        </Canvas>
      </Root>
    )
  }
)

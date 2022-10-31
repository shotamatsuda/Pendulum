import { styled } from '@mui/material'
import { Circle, OrthographicCamera } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ScaleLinear, interpolateTurbo } from 'd3'
import { MotionValue, useTransform } from 'framer-motion'
import { motion } from 'framer-motion-3d'
import { useAtomValue } from 'jotai'
import React, { ComponentPropsWithRef, forwardRef, useCallback } from 'react'
import { Vector2 } from 'three'

import { MotionPropagation } from './MotionPropagation'
import { PhaseGraphFrame } from './PhageGraphFrame'
import { Propagation } from './Propagation'
import { RepeatRenderPlane } from './RepeatRenderPlane'
import { VectorField } from './VectorField'
import { State } from './pendulum'
import {
  colorizeStore,
  derivativeStore,
  graphScaleStore,
  paramsStore,
  propagationStateStore,
  stateCommittedStore,
  stateStore
} from './stores'

const Root = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  touchAction: 'none'
})

const StateCircle: React.FC<{
  state: MotionValue<State>
  scale: ScaleLinear<number, number>
}> = ({ state, scale }) => {
  const x = useTransform(state, ({ angle }) => scale(angle))
  const y = useTransform(state, ({ velocity }) => scale(velocity))
  return (
    <motion.group position-x={x} position-y={y}>
      <Circle args={[6, 32]}>
        <meshBasicMaterial transparent />
      </Circle>
    </motion.group>
  )
}

export interface PhaseGraphProps extends ComponentPropsWithRef<typeof Root> {
  vectorScale?: number
  colorScale?: number
}

const epsilon = 1e-5

export const PhaseGraph = forwardRef<HTMLDivElement, PhaseGraphProps>(
  ({ vectorScale = 4, colorScale = 0.25, ...props }, forwardedRef) => {
    const params = useAtomValue(paramsStore)
    const colorize = useAtomValue(colorizeStore)
    const derivative = useAtomValue(derivativeStore)
    const propagationState = useAtomValue(propagationStateStore)
    const state = useAtomValue(stateStore)
    const stateCommitted = useAtomValue(stateCommittedStore)
    const scale = useAtomValue(graphScaleStore)

    const vector = useCallback(
      ([angle, velocity]: [number, number]): [number, number] =>
        new Vector2(velocity, derivative({ angle, velocity })).toArray(),
      [derivative]
    )

    const repeatSize = Math.abs(scale(-Math.PI) - scale(Math.PI))
    const propagationProps = {
      derivative,
      scale
    }
    return (
      <Root ref={forwardedRef} {...props}>
        <Canvas flat style={{ position: 'absolute' }}>
          <OrthographicCamera makeDefault far={1000} near={-1000} />
          <RepeatRenderPlane width={repeatSize} height={repeatSize}>
            <OrthographicCamera
              makeDefault
              far={1000}
              near={-1000}
              right={repeatSize / 2}
              left={-repeatSize / 2}
              top={repeatSize / 2}
              bottom={-repeatSize / 2}
            />
            <VectorField
              vector={vector}
              color={colorize ? interpolateTurbo : undefined}
              range={Math.PI * 2}
              scale={scale}
              interval={20}
              vectorScale={vectorScale}
              colorScale={colorScale}
            />
            <Propagation
              {...propagationProps}
              angle={-Math.PI + epsilon}
              velocity={epsilon}
              opacity={2 / 3}
              dashed
              dashSize={5}
              {...(params.damping === 0 && {
                maxAngle: Math.PI,
                minVelocity: 0
              })}
            />
            <Propagation
              {...propagationProps}
              angle={Math.PI - epsilon}
              velocity={-epsilon}
              opacity={2 / 3}
              dashed
              dashSize={5}
              {...(params.damping === 0 && {
                minAngle: -Math.PI,
                maxVelocity: 0
              })}
            />
          </RepeatRenderPlane>
          {propagationState != null && (
            <MotionPropagation
              {...propagationProps}
              state={propagationState}
              lineWidth={1.5}
              color={0xaaaaaa}
              visible={stateCommitted}
            />
          )}
          <MotionPropagation
            {...propagationProps}
            state={state}
            lineWidth={1.5}
          />
          <StateCircle state={state} scale={scale} />
        </Canvas>
        <PhaseGraphFrame scale={scale} />
      </Root>
    )
  }
)

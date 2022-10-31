import { useTheme } from '@mui/material'
import { LineProps } from '@react-three/drei'
import { ScaleLinear } from 'd3'
import { MotionValue } from 'framer-motion'
import React, { useCallback, useEffect } from 'react'
import { Line2, LineMaterial, LineSegmentsGeometry } from 'three-stdlib'
import invariant from 'tiny-invariant'
import { SetOptional } from 'type-fest'

import { PropagationParams, State, propagate } from './pendulum'
import { useConstant } from './useConstant'
import { useResolution } from './useResolution'

export interface MotionPropagationProps
  extends Omit<LineProps, 'points' | 'scale'>,
    SetOptional<
      Omit<PropagationParams, 'state' | 'condition'>,
      'steps' | 'delta'
    > {
  state: MotionValue<State>
  scale: ScaleLinear<number, number>
  minAngle?: number
  maxAngle?: number
  minVelocity?: number
  maxVelocity?: number
}

export const MotionPropagation: React.FC<MotionPropagationProps> = ({
  state,
  derivative,
  scale,
  minAngle = -Infinity,
  maxAngle = Infinity,
  minVelocity = -Infinity,
  maxVelocity = Infinity,
  steps = 1000,
  delta = 0.1,
  ...props
}) => {
  const condition = useCallback(
    ({ angle, velocity }: State) =>
      angle > minAngle &&
      angle < maxAngle &&
      velocity > minVelocity &&
      velocity < maxVelocity,
    [minAngle, maxAngle, minVelocity, maxVelocity]
  )

  const line = useConstant(() => new Line2())
  const geometry = useConstant(() => new LineSegmentsGeometry())
  const material = useConstant(() => new LineMaterial())
  const positions = useConstant(() => new Float32Array((steps - 1) * 6))

  useEffect(() => {
    const handleChange = (state: State): void => {
      const states = propagate({
        state,
        derivative,
        delta,
        steps,
        condition
      })
      invariant(states.length > 0)

      // Converts [state1, state2, state3, ...]
      // to [x1, y1, z1, x2, y2, z2, x2, y2, z2, x3, y3, z3, ...]
      const length = (states.length - 1) * 6
      positions[0] = scale(state.angle)
      positions[1] = scale(state.velocity)
      for (
        let stateIndex = 0, index = 3;
        stateIndex < states.length - 1;
        ++stateIndex, index += 6
      ) {
        const [angle, velocity] = states[stateIndex]
        const x = scale(angle)
        const y = scale(velocity)
        positions[index + 0] = positions[index + 3] = x
        positions[index + 1] = positions[index + 4] = y
      }
      const [lastAngle, lastVelocity] = states[states.length - 1]
      positions[length - 3] = scale(lastAngle)
      positions[length - 2] = scale(lastVelocity)
      positions.fill(0, length)
      geometry.setPositions(positions)
      line.computeLineDistances()
    }

    handleChange(state.get())
    return state.onChange(handleChange)
  }, [
    state,
    derivative,
    scale,
    steps,
    delta,
    condition,
    line,
    geometry,
    positions
  ])

  const resolution = useResolution()
  const theme = useTheme()
  return (
    <primitive object={line} {...props}>
      <primitive object={geometry} attach='geometry' />
      <primitive
        object={material}
        attach='material'
        color={theme.palette.primary.main}
        transparent
        linewidth={props.linewidth ?? props.lineWidth}
        resolution={resolution}
        {...props}
      />
    </primitive>
  )
}

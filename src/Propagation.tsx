import { useMotionValue } from 'framer-motion'
import React, { useEffect } from 'react'

import { MotionPropagation, MotionPropagationProps } from './MotionPropagation'
import { State } from './pendulum'

export interface PropagationProps
  extends Omit<MotionPropagationProps, 'state'> {
  angle: number
  velocity: number
}

export const Propagation: React.FC<PropagationProps> = ({
  angle,
  velocity,
  ...props
}) => {
  const state = useMotionValue<State>({ angle, velocity })
  useEffect(() => {
    state.set({ angle, velocity })
  }, [state, angle, velocity])
  return <MotionPropagation state={state} {...props} />
}

import { scaleLinear } from 'd3'
import { motionValue } from 'framer-motion'
import { atom } from 'jotai'

import { Params, State, configureDerivative } from './pendulum'

export const paramsStore = atom<Params>({
  gravity: 9.8,
  length: 10,
  damping: 0
})

export const colorizeStore = atom(false)
export const pointerVelocityStore = atom(false)

export const derivativeStore = atom(get =>
  configureDerivative(get(paramsStore))
)

export const propagationStateStore = atom(
  motionValue<State>({
    angle: 0,
    velocity: 0
  })
)

export const stateStore = atom(
  motionValue<State>({
    angle: Math.PI / 4,
    velocity: 0
  })
)

export const stateCommittedStore = atom(true)

export const graphSizeStore = atom({
  width: 1,
  height: 1
})

export const graphScaleStore = atom(get => {
  const height = Math.max(get(graphSizeStore).height, 1)
  return scaleLinear()
    .domain([-Math.PI, Math.PI])
    .range([-height / 2, height / 2])
})

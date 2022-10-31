import { Vector2 } from 'three'

export interface State {
  angle: number
  velocity: number
}

export interface Params {
  gravity: number
  length: number
  damping: number
}

export type Derivative = (state: State) => number

export const configureDerivative =
  ({ gravity, length, damping }: Params): Derivative =>
  ({ angle, velocity }) =>
    -damping * velocity - (gravity / length) * Math.sin(angle)

export interface IntegrationParams {
  derivative: (state: State) => number
  state: State
  delta: number
}

export interface IntegrationResult extends State {
  acceleration: number
}

function k(
  state: State,
  derivative: Derivative,
  k: Vector2,
  result: Vector2
): Vector2 {
  const angle = state.angle + k.x
  const velocity = state.velocity + k.y
  return result.set(velocity, derivative({ angle, velocity }))
}

const scratch0 = new Vector2()
const scratch1 = new Vector2()
const scratch2 = new Vector2()
const scratch3 = new Vector2()
const scratch4 = new Vector2()

// 4th order Runge-Kutta integration
export function integrate({
  state,
  derivative,
  delta
}: IntegrationParams): IntegrationResult {
  scratch0.set(0, 0)
  const k1 = k(state, derivative, scratch0, scratch1).multiplyScalar(delta)
  const k2 = k(
    state,
    derivative,
    scratch0.copy(k1).divideScalar(2),
    scratch2
  ).multiplyScalar(delta)
  const k3 = k(
    state,
    derivative,
    scratch0.copy(k2).divideScalar(2),
    scratch3
  ).multiplyScalar(delta)
  const k4 = k(state, derivative, k3, scratch4).multiplyScalar(delta)
  const { x: velocity, y: acceleration } = k1
    .add(scratch0.copy(k2).multiplyScalar(2))
    .add(scratch0.copy(k3).multiplyScalar(2))
    .add(k4)
    .divideScalar(6)

  return {
    angle: state.angle + velocity,
    velocity: state.velocity + acceleration,
    acceleration
  }
}

export interface PropagationParams extends IntegrationParams {
  steps: number
  condition?: (state: State) => boolean
}

export function propagate({
  state: initialState,
  steps,
  condition,
  ...params
}: PropagationParams): Array<[number, number]> {
  const states: Array<[number, number]> = []
  let state = initialState
  for (let step = 0; step < steps; ++step) {
    if (condition?.(state) === false) {
      break
    }
    states.push([state.angle, state.velocity])
    state = integrate({ ...params, state })
  }
  return states
}

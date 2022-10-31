import { useAnimationFrame } from 'framer-motion'
import { useAtomValue } from 'jotai'

import { integrate } from './pendulum'
import { derivativeStore, stateCommittedStore, stateStore } from './stores'

export function useStateAnimation(): void {
  const derivative = useAtomValue(derivativeStore)
  const state = useAtomValue(stateStore)
  const stateCommitted = useAtomValue(stateCommittedStore)

  useAnimationFrame((time, delta) => {
    if (!stateCommitted) {
      return
    }
    const nextState = integrate({
      state: state.get(),
      derivative,
      delta: delta / 300 // Arbitrary scale
    })
    state.set(nextState)
  })
}

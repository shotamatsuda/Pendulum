import { ThreeEvent } from '@react-three/fiber'
import { useAnimationFrame } from 'framer-motion'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import { MathUtils, Vector2 } from 'three'

import { pointerVelocityStore, stateCommittedStore, stateStore } from './stores'

const scratch1 = new Vector2()
const scratch2 = new Vector2()

function mod(angle: number): number {
  return MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI
}

export interface SceneEventHandlersOptions {
  dampingFactor?: number
}

export interface SceneEventHandlers {
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void
}

export function useSceneEventHandlers({
  dampingFactor = 0.3
}: SceneEventHandlersOptions = {}): SceneEventHandlers {
  const state = useAtomValue(stateStore)
  const setStateCommitted = useSetAtom(stateCommittedStore)
  const pointerVelocity = useAtomValue(pointerVelocityStore)

  const angleRef = useRef<number>()
  const pointersRef = useRef<PointerEvent[]>([])

  useAnimationFrame((time, deltaTime) => {
    if (angleRef.current == null || pointersRef.current.length !== 1) {
      return
    }
    if (!pointerVelocity) {
      state.set({
        angle: angleRef.current,
        velocity: 0
      })
      return
    }
    const prev = state.get().angle
    const next = angleRef.current
    scratch1.set(Math.cos(prev), Math.sin(prev))
    scratch2.set(Math.cos(next), Math.sin(next))
    const delta = scratch1.cross(scratch2)
    state.set({
      angle: mod(prev + delta * dampingFactor),
      velocity: Math.min(
        Math.max(
          (delta / deltaTime) * 100, // Arbitrary scale
          -Math.PI
        ),
        Math.PI
      )
    })
  })

  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (
      pointersRef.current.length !== 1 ||
      event.nativeEvent.pointerId !== pointersRef.current[0].pointerId ||
      event.uv == null
    ) {
      return
    }
    angleRef.current = Math.atan2(event.uv.x - 0.5, 0.5 - event.uv.y)
  }, [])

  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      if (
        event.nativeEvent.pointerType !== 'mouse' ||
        event.nativeEvent.button === 0
      ) {
        pointersRef.current.push(event.nativeEvent)
      }
      if (pointersRef.current.length === 1) {
        handlePointerMove(event)
        setStateCommitted(false)
      }
    },
    [setStateCommitted, handlePointerMove]
  )

  useEffect(() => {
    const handlePointerUpOrCancel = (event: PointerEvent): void => {
      pointersRef.current = pointersRef.current.filter(
        ({ pointerId }) => pointerId !== event.pointerId
      )
      if (pointersRef.current.length === 0) {
        angleRef.current = undefined
        setStateCommitted(true)
      }
    }

    window.addEventListener('pointerup', handlePointerUpOrCancel)
    window.addEventListener('pointercancel', handlePointerUpOrCancel)
    return () => {
      window.removeEventListener('pointerup', handlePointerUpOrCancel)
      window.removeEventListener('pointercancel', handlePointerUpOrCancel)
    }
  }, [setStateCommitted])

  return {
    onPointerMove: handlePointerMove,
    onPointerDown: handlePointerDown
  }
}

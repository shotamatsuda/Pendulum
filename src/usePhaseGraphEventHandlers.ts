import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useEffect, useRef } from 'react'

import {
  graphScaleStore,
  graphSizeStore,
  propagationStateStore,
  stateCommittedStore,
  stateStore
} from './stores'

export interface PhaseGraphEventHandlersOptions {
  element: HTMLDivElement | null
}

export interface PhaseGraphEventHandlers<T = HTMLDivElement> {
  onPointerMove: React.PointerEventHandler<T>
  onPointerLeave: React.PointerEventHandler<T>
}

export function usePhaseGraphEventHandlers({
  element
}: PhaseGraphEventHandlersOptions): PhaseGraphEventHandlers {
  const setSize = useSetAtom(graphSizeStore)
  const rectRef = useRef<DOMRect>()
  useEffect(() => {
    if (element == null) {
      return
    }
    const callback = (): void => {
      const rect = element.getBoundingClientRect()
      rectRef.current = rect
      setSize({
        width: rect.width,
        height: rect.height
      })
    }
    callback()
    const observer = new ResizeObserver(callback)
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [element, setSize])

  const propagationState = useAtomValue(propagationStateStore)
  const state = useAtomValue(stateStore)
  const setStateCommitted = useSetAtom(stateCommittedStore)
  const scale = useAtomValue(graphScaleStore)

  const getNextState = useCallback(
    (event: PointerEvent) => {
      const rect = rectRef.current
      if (rect == null) {
        return
      }
      const offsetX = rect.x + rect.width / 2
      const offsetY = rect.y + rect.height / 2
      return {
        angle: scale.invert(event.clientX - offsetX),
        velocity: scale.invert(offsetY - event.clientY)
      }
    },
    [scale]
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return
      }
      const nextState = getNextState(event.nativeEvent)
      if (nextState != null) {
        propagationState.set(nextState)
      }
    },
    [propagationState, getNextState]
  )

  const handlePointerLeave = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== 'mouse') {
        return
      }
      propagationState.set({
        angle: 0,
        velocity: 0
      })
    },
    [propagationState]
  )

  useEffect(() => {
    if (element == null) {
      return
    }
    let pointers: PointerEvent[] = []

    const handlePointerMove = (event: PointerEvent): void => {
      if (pointers.length !== 1 || event.pointerId !== pointers[0].pointerId) {
        return
      }
      const nextState = getNextState(event)
      if (nextState != null) {
        state.set(nextState)
      }
    }

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.pointerType !== 'mouse' || event.button === 0) {
        pointers.push(event)
      }
      if (pointers.length === 1) {
        handlePointerMove(event)
        setStateCommitted(false)
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUpOrCancel)
      }
    }

    const handlePointerUpOrCancel = (event: PointerEvent): void => {
      pointers = pointers.filter(
        ({ pointerId }) => pointerId !== event.pointerId
      )
      if (pointers.length === 0) {
        setStateCommitted(true)
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUpOrCancel)
      }
    }

    element.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointercancel', handlePointerUpOrCancel)
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointercancel', handlePointerUpOrCancel)
    }
  }, [element, state, setStateCommitted, getNextState])

  return {
    onPointerMove: handlePointerMove,
    onPointerLeave: handlePointerLeave
  }
}

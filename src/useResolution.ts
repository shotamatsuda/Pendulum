import { useThree } from '@react-three/fiber'
import { useContext, useMemo } from 'react'
import { Vector2 } from 'three'

import { ResolutionContext } from './ResolutionProvider'

export function useResolution(): Vector2 {
  const context = useContext(ResolutionContext)
  const size = useThree(({ size }) => size)
  const fallback = useMemo(() => new Vector2(size.width, size.height), [size])
  return context ?? fallback
}

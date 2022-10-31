import React, { ReactNode, createContext, useMemo } from 'react'
import { Vector2 } from 'three'

export const ResolutionContext = createContext<Vector2 | undefined>(undefined)

export interface ResolutionProviderProps {
  width: number
  height: number
  children?: ReactNode
}

export const ResolutionProvider: React.FC<ResolutionProviderProps> = ({
  width,
  height,
  children
}) => {
  const context = useMemo(() => new Vector2(width, height), [width, height])
  return (
    <ResolutionContext.Provider value={context}>
      {children}
    </ResolutionContext.Provider>
  )
}

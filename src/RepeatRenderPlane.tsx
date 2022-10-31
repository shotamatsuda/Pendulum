import { Plane, RenderTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import React, { ReactNode, useMemo } from 'react'
import { RepeatWrapping, Vector2 } from 'three'

import { ResolutionProvider } from './ResolutionProvider'

export interface RepeatRenderPlaneProps {
  width: number
  height: number
  children?: ReactNode
}

export const RepeatRenderPlane: React.FC<RepeatRenderPlaneProps> = ({
  width,
  height,
  children
}) => {
  const size = useThree(({ size }) => size)
  const offset = useMemo(
    () =>
      new Vector2(
        (width - size.width) / width / 2,
        (height - size.height) / height / 2
      ),
    [width, height, size]
  )
  const repeat = useMemo(
    () => new Vector2(size.width / width, size.height / height),
    [width, height, size]
  )

  return (
    <Plane args={[size.width, size.height]}>
      <meshBasicMaterial transparent>
        <RenderTexture
          attach='map'
          width={width}
          height={height}
          offset={offset}
          repeat={repeat}
          wrapS={RepeatWrapping}
          wrapT={RepeatWrapping}
        >
          <ResolutionProvider width={width} height={height}>
            {children}
          </ResolutionProvider>
        </RenderTexture>
      </meshBasicMaterial>
    </Plane>
  )
}

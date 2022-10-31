import { useTheme } from '@mui/material'
import { useThree } from '@react-three/fiber'
import { ScaleLinear } from 'd3'
import React, { Fragment, useEffect, useMemo, useRef } from 'react'
import { DynamicDrawUsage, InstancedMesh, Matrix4, Object3D } from 'three'
import { Line2, LineMaterial, LineSegmentsGeometry } from 'three-stdlib'

import { useConstant } from './useConstant'
import { useResolution } from './useResolution'

const Lines: React.FC<{
  positions: Float32Array
  colors: Float32Array
  count: number
  lineWidth?: number
}> = ({ positions, colors, count, lineWidth = 1 }) => {
  const line = useConstant(() => new Line2())
  const geometry = useConstant(() => new LineSegmentsGeometry())
  const material = useConstant(() => new LineMaterial())

  useEffect(() => {
    geometry.instanceCount = count
  }, [count, geometry])

  useEffect(() => {
    geometry.setPositions(positions)
    line.computeLineDistances()
  }, [positions, line, geometry])

  useEffect(() => {
    geometry.setColors(colors)
  }, [colors, geometry])

  const resolution = useResolution()
  return (
    <primitive object={line}>
      <primitive object={geometry} attach='geometry' />
      <primitive
        object={material}
        attach='material'
        vertexColors
        color='white'
        transparent
        linewidth={lineWidth}
        resolution={resolution}
      />
    </primitive>
  )
}

const Arrows: React.FC<{
  positions: Float32Array
  colors: Float32Array
  count: number
}> = ({ positions, colors, count }) => {
  const meshRef = useRef<InstancedMesh>(null)
  const objectRef = useRef<Object3D>(null)
  const instanceMatrices = useConstant(() => {
    const array = new Float32Array(count * 16)
    const matrix = new Matrix4().identity()
    for (let index = 0; index < count; index += 16) {
      matrix.toArray(array, index)
    }
    return array
  })
  const instanceColors = useConstant(() => new Float32Array(count * 3))

  useEffect(() => {
    if (meshRef.current != null) {
      meshRef.current.count = count
    }
  }, [count])

  useEffect(() => {
    const mesh = meshRef.current
    const object = objectRef.current
    if (mesh == null || object == null) {
      return
    }
    for (
      let instanceIndex = 0, index = 0;
      instanceIndex < count;
      ++instanceIndex, index += 6
    ) {
      const x1 = positions[index + 0]
      const y1 = positions[index + 1]
      const x2 = positions[index + 3]
      const y2 = positions[index + 4]
      const a = Math.atan2(y2 - y1, x2 - x1)
      object.position.set(x2 + Math.cos(a) * 1.5, y2 + Math.sin(a) * 1.5, 0)
      object.rotation.set(0, 0, a)
      object.updateMatrix()
      mesh.setMatrixAt(instanceIndex, object.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [positions, colors, count])

  useEffect(() => {
    const mesh = meshRef.current
    if (mesh == null || mesh.instanceColor == null) {
      return
    }
    for (
      let instanceIndex = 0, index = 0;
      instanceIndex < count;
      ++instanceIndex, index += 6
    ) {
      const r = colors[index + 0]
      const g = colors[index + 1]
      const b = colors[index + 2]
      mesh.instanceColor.setXYZ(instanceIndex, r, g, b)
    }
    mesh.instanceColor.needsUpdate = true
  }, [colors, count])

  return (
    <instancedMesh ref={meshRef}>
      <object3D ref={objectRef} />
      <circleGeometry args={[3, 3]} attach='geometry' />
      <meshBasicMaterial color='white' />
      <instancedBufferAttribute
        attach='instanceMatrix'
        array={instanceMatrices}
        count={count}
        itemSize={16}
        usage={DynamicDrawUsage}
      />
      <instancedBufferAttribute
        attach='instanceColor'
        array={instanceColors}
        count={count}
        itemSize={3}
        usage={DynamicDrawUsage}
      />
    </instancedMesh>
  )
}

export interface VectorFieldProps {
  vector: (point: [number, number]) => [number, number]
  color?: (value: number) => string
  range: number
  scale: ScaleLinear<number, number>
  interval: number
  vectorScale?: number
  colorScale?: number
}

export const VectorField: React.FC<VectorFieldProps> = ({
  vector,
  color,
  range,
  scale,
  interval,
  vectorScale = 1,
  colorScale = 1
}) => {
  const height = useThree(({ viewport }) => viewport.height)
  const steps = Math.round(height / interval / 2) * 2

  const data = useMemo(() => {
    const data: Array<{
      point: [number, number]
      vector: [number, number]
    }> = []
    if (steps === 0) {
      return data
    }
    // Extra rows and columns at the edges for repeating.
    for (let row = -1, index = 0; row < steps + 1; ++row) {
      for (let col = -1; col < steps + 1; ++col, ++index) {
        const x = ((col - steps / 2 + 0.5) / steps) * range
        const y = ((row - steps / 2 + 0.5) / steps) * range
        data.push({
          point: [scale(x), scale(y)],
          vector: vector([x, y])
        })
      }
    }
    return data
  }, [vector, steps, range, scale])

  const positions = useMemo(() => {
    const positions = new Float32Array(data.length * 6)
    let index = 0
    data.forEach(({ point: [x1, y1], vector: [x2, y2] }) => {
      positions[index + 0] = x1
      positions[index + 1] = y1
      positions[index + 3] = x1 + x2 * vectorScale
      positions[index + 4] = y1 + y2 * vectorScale
      index += 6
    })
    return positions
  }, [data, vectorScale])

  const lookupTable = useMemo(
    () =>
      color != null
        ? [...Array(0x100)].map((_, index, { length }) => {
            // Assume the color function returns "rgb()" string.
            const [r, g, b] = color(index / length)
              .slice(4, -1)
              .split(',')
            return [+r / 0xff, +g / 0xff, +b / 0xff]
          })
        : undefined,
    [color]
  )

  const theme = useTheme()
  const colors = useMemo(() => {
    const colors = new Float32Array(data.length * 6)
    if (lookupTable == null) {
      return colors.fill(theme.palette.mode === 'light' ? 0.8 : 0.2)
    }
    let index = 0
    data.forEach(({ vector: [x, y] }) => {
      const [r, g, b] =
        lookupTable[
          Math.floor(
            Math.min(Math.max(Math.hypot(x, y) * colorScale, 0), 1) * 0xff
          )
        ]
      colors[index + 0] = colors[index + 3] = r
      colors[index + 1] = colors[index + 4] = g
      colors[index + 2] = colors[index + 5] = b
      index += 6
    })
    return colors
  }, [colorScale, data, lookupTable, theme])

  // We must create a new InstancedMesh when we need more instances.
  const count = data.length
  const countRef = useRef<number>()
  const maxCount = Math.max(count, countRef.current ?? 0)
  countRef.current = count

  return (
    <Fragment key={maxCount}>
      <Lines positions={positions} colors={colors} count={count} />
      <Arrows positions={positions} colors={colors} count={count} />
    </Fragment>
  )
}

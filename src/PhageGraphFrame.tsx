import { styled, useMediaQuery, useTheme } from '@mui/material'
import { ScaleLinear } from 'd3'
import { useAtomValue } from 'jotai'
import React, {
  ComponentPropsWithoutRef,
  Fragment,
  SVGAttributes,
  useCallback
} from 'react'

import { graphSizeStore } from './stores'

const Svg = styled('svg')({
  overflow: 'visible',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
})

export interface PhaseGraphFrameProps
  extends Omit<ComponentPropsWithoutRef<typeof Svg>, 'scale'> {
  scale: ScaleLinear<number, number>
}

export const PhaseGraphFrame: React.FC<PhaseGraphFrameProps> = ({
  scale,
  ...props
}) => {
  const size = useAtomValue(graphSizeStore)

  const theme = useTheme()
  const smUp = useMediaQuery(theme.breakpoints.up('sm'))
  const textColor = smUp
    ? theme.palette.text.secondary
    : theme.palette.text.primary
  const fontSize = smUp
    ? theme.typography.body2.fontSize
    : theme.typography.caption.fontSize

  const centerX = size.width / 2
  const centerY = size.height / 2
  const phaseWidth = scale(Math.PI * 2)

  const Tick = useCallback(
    ({ x, ...props }: SVGAttributes<SVGTextElement>) => (
      <>
        <text
          dy={smUp ? '-1em' : '2em'}
          fill={textColor}
          fontSize={fontSize}
          textAnchor='middle'
          {...props}
          x={x}
        />
        <line
          x1={x}
          x2={x}
          y1={-centerY}
          y2={centerY}
          stroke={theme.palette.primary.main}
          strokeOpacity={0.2}
        />
      </>
    ),
    [smUp, theme, textColor, fontSize, centerY]
  )

  return (
    <Svg {...props}>
      <svg x='50%' overflow='visible'>
        <text
          dy={smUp ? '-1em' : '2em'}
          fill={textColor}
          fontSize={fontSize}
          textAnchor='middle'
        >
          Angle of pendulum
        </text>
      </svg>
      <svg y='50%' overflow='visible'>
        <text
          dy={smUp ? '-1em' : '2em'}
          fill={textColor}
          fontSize={fontSize}
          textAnchor='middle'
          transform='rotate(-90)'
        >
          Angular velocity
        </text>
      </svg>
      <line
        x1={0}
        x2='100%'
        y1='50%'
        y2='50%'
        stroke={theme.palette.primary.main}
        strokeOpacity={0.5}
      />
      <line
        x1='50%'
        x2='50%'
        y1={0}
        y2='100%'
        stroke={theme.palette.primary.main}
        strokeOpacity={0.5}
      />
      {phaseWidth > 150 && (
        <g transform={`translate(${centerX}, ${centerY})`}>
          {[...Array(Math.floor(size.width / phaseWidth))].map((_, index) => {
            return (
              <Fragment key={index}>
                <Tick x={scale((index + 1) * -Math.PI)} y={-centerY}>
                  {'\u2212'}
                  {index > 0 && index + 1}π
                </Tick>
                <Tick x={scale((index + 1) * Math.PI)} y={-centerY}>
                  {index > 0 && index + 1}π
                </Tick>
              </Fragment>
            )
          })}
        </g>
      )}
    </Svg>
  )
}

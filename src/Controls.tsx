import { Box, Stack, useMediaQuery, useTheme } from '@mui/material'
import { useAtom } from 'jotai'
import React, { useCallback } from 'react'

import { SliderControl } from './SliderControl'
import { SwitchControl } from './SwitchControl'
import { colorizeStore, paramsStore, pointerVelocityStore } from './stores'

export const Controls: React.FC = React.memo(() => {
  const [params, setParams] = useAtom(paramsStore)
  const [colorize, setColorize] = useAtom(colorizeStore)
  const [pointerVelocity, setPointerVelocity] = useAtom(pointerVelocityStore)

  const handleSliderChange = useCallback(
    (event: any, value: number | number[]) => {
      if (typeof value !== 'number') {
        return
      }
      if (['gravity', 'length', 'damping'].includes(event.target.name)) {
        setParams(params => ({
          ...params,
          [event.target.name]: value
        }))
      }
    },
    [setParams]
  )

  const handleSwitchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      const events = {
        colorize: setColorize,
        pointerVelocity: setPointerVelocity
      }
      events[event.target.name as keyof typeof events]?.(checked)
    },
    [setColorize, setPointerVelocity]
  )

  const theme = useTheme()
  const mdDown = useMediaQuery(theme.breakpoints.down('md'))
  const sliders = [
    <SliderControl
      key='gravity'
      name='gravity'
      label='Gravity'
      min={1}
      max={20}
      value={params.gravity}
      onChange={handleSliderChange}
      fullWidth={mdDown}
    />,
    <SliderControl
      key='length'
      name='length'
      label='Length'
      min={5}
      max={30}
      value={params.length}
      onChange={handleSliderChange}
      fullWidth={mdDown}
    />,
    <SliderControl
      key='damping'
      name='damping'
      label='Damping'
      min={0}
      max={1}
      value={params.damping}
      onChange={handleSliderChange}
      fullWidth={mdDown}
    />
  ]
  const switches = [
    <SwitchControl
      key='colorize'
      name='colorize'
      label='Colorize'
      checked={colorize}
      onChange={handleSwitchChange}
    />,
    <SwitchControl
      key='pointerVelocity'
      name='pointerVelocity'
      label='Pointer Velocity'
      checked={pointerVelocity}
      onChange={handleSwitchChange}
    />
  ]
  if (mdDown) {
    return (
      <Stack direction='row' spacing={2}>
        <Box component='div' sx={{ flexGrow: 1, flexShrink: 1 }}>
          {sliders}
        </Box>
        <Box component='div'>{switches}</Box>
      </Stack>
    )
  }
  return (
    <Stack direction='row' spacing={3} sx={{ justifyContent: 'center' }}>
      {sliders}
      {switches}
    </Stack>
  )
})

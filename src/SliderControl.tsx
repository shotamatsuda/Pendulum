import {
  Slider,
  SliderProps,
  Stack,
  StackProps,
  Typography,
  TypographyProps,
  sliderClasses,
  styled
} from '@mui/material'
import { shouldForwardProp } from '@mui/system'
import React, { useCallback, useRef } from 'react'
import invariant from 'tiny-invariant'

const Root = styled(Stack, {
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'fullWidth'
})<StackProps & { fullWidth: boolean }>(({ theme, fullWidth }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  height: 32, // To align with SwitchControl
  flexBasis: theme.spacing(32),
  ...(fullWidth && {
    width: '100%'
  })
}))

const StyledSlider = styled(Slider)({
  flexGrow: 1,
  flexShrink: 1,
  [`.${sliderClasses.thumb}`]: {
    opacity: 0
  }
})

const Text = styled(Typography, {
  shouldForwardProp: prop => shouldForwardProp(prop) && prop !== 'fixedWidth'
})<
  TypographyProps & {
    fixedWidth: boolean
  }
>(({ fixedWidth }) => ({
  ...(fixedWidth && {
    flexGrow: 0,
    flexShrink: 0
  })
}))

const Label = styled(Text)(({ theme }) => ({
  flexBasis: theme.spacing(8)
}))

const Value = styled(Text)(({ theme }) => ({
  flexBasis: theme.spacing(4),
  textAlign: 'right'
}))

export interface SliderControlProps
  extends Omit<SliderProps, 'defaultValue' | 'value' | 'onChange'> {
  label: string
  defaultValue?: number
  value?: number
  onChange?: (event: Event, value: number, activeThumb: number) => void
  fullWidth?: boolean
}

export const SliderControl: React.FC<SliderControlProps> = React.memo(
  ({ label, value, onChange, fullWidth = false, sx, ...props }) => {
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange
    const handleChange: NonNullable<SliderProps['onChange']> = useCallback(
      (event, value, activeThumb) => {
        invariant(!Array.isArray(value))
        onChangeRef.current?.(event, value, activeThumb)
      },
      []
    )
    return (
      <Root direction='row' spacing={2} fullWidth={fullWidth} sx={sx}>
        <Label variant='body2' fixedWidth={fullWidth}>
          {label}
        </Label>
        <StyledSlider
          size='small'
          min={0}
          max={1}
          step={Number.EPSILON}
          {...props}
          value={value}
          onChange={handleChange}
          aria-label={label}
        />
        <Value variant='body2' color='text.secondary' fixedWidth={fullWidth}>
          {value?.toFixed(1)}
        </Value>
      </Root>
    )
  }
)

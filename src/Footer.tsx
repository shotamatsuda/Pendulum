import { Link, Stack, Typography } from '@mui/material'
import React from 'react'

export const Footer: React.FC = () => (
  <Stack
    direction='row'
    spacing={1}
    sx={{ position: 'absolute' }}
    left={theme => ({
      xs: theme.spacing(2),
      sm: theme.spacing(3)
    })}
    bottom={theme => ({
      xs: theme.spacing(2),
      sm: theme.spacing(3)
    })}
  >
    <Typography variant='caption' color='text.secondary'>
      Shota Matsuda, 2022.
    </Typography>
    <Typography variant='caption'>
      <Link
        href='https://github.com/shotamatsuda/Pendulum'
        color='text.secondary'
      >
        Source Code
      </Link>
    </Typography>
  </Stack>
)

import { Box, Grid, Stack } from '@mui/material'
import React, { useState } from 'react'

import { Controls } from './Controls'
import { Footer } from './Footer'
import { PhaseGraph } from './PhaseGraph'
import { Scene } from './Scene'
import { usePhaseGraphEventHandlers } from './usePhaseGraphEventHandlers'
import { useSceneEventHandlers } from './useSceneEventHandlers'
import { useStateAnimation } from './useStateAnimation'

export const Main: React.FC = () => {
  const [graph, setGraph] = useState<HTMLDivElement | null>(null)
  const phaseGraphEventHandlers = usePhaseGraphEventHandlers({ element: graph })
  const sceneEventHandlers = useSceneEventHandlers()

  useStateAnimation()

  return (
    <Stack
      sx={{
        width: '100%',
        height: '100%',
        userSelect: 'none'
      }}
      spacing={{ xs: 1, sm: 4, md: 5 }}
      padding={{ xs: 0, sm: 6, md: 7 }}
      paddingBottom={{ xs: 6, sm: 8, md: 9 }}
    >
      <Grid container spacing={{ xs: 0, sm: 6, md: 8 }} sx={{ flexGrow: 1 }}>
        <Grid item xs={12}>
          <Scene {...sceneEventHandlers} />
        </Grid>
        <Grid item xs={12}>
          <PhaseGraph ref={setGraph} {...phaseGraphEventHandlers} />
        </Grid>
      </Grid>
      <Box
        component='div'
        paddingLeft={{ xs: 2, sm: 0 }}
        paddingRight={{ xs: 2, sm: 0 }}
      >
        <Controls />
      </Box>
      <Footer />
    </Stack>
  )
}

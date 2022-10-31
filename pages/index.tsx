import { GlobalStyles, css } from '@mui/material'
import { NextPage } from 'next'
import React from 'react'

import { Main } from '../src/Main'

const Index: NextPage = () => {
  return (
    <>
      <GlobalStyles
        styles={css`
          html,
          body,
          #__next {
            width: 100%;
            height: 100%;
          }
        `}
      />
      <Main />
    </>
  )
}

export default Index

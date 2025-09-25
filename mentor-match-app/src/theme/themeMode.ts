import { useMemo, useState } from 'react'
import type { PaletteMode } from '@mui/material'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { getTheme } from './index'

export const useColorTheme = () => {
  const [mode, setMode] = useState<PaletteMode>('light')

  const toggleColorMode = () =>
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'))

  const modifiedTheme = useMemo(() => createTheme(getTheme(mode)), [mode])

  return {
    theme: responsiveFontSizes(modifiedTheme),
    mode,
    toggleColorMode
  }
}

import type { PaletteMode } from '@mui/material'
import { getTheme } from './index.tsx'
import { useMemo, useState } from 'react'
import { createTheme } from '@mui/material'
import { responsiveFontSizes } from '@mui/material/styles'

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

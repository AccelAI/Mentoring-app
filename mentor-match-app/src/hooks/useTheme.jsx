import { createTheme } from '@mui/material'
import { createContext, useContext } from 'react'
import { useColorTheme } from '../theme/themeMode.tsx'
import { ThemeProvider } from '@mui/material'

const ThemeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
  theme: createTheme()
})

export const ThemeContextProvider = ({ children }) => {
  const value = useColorTheme()
  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={value.theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  return useContext(ThemeContext)
}

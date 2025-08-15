import { PaletteMode } from '@mui/material'
import { PaletteColorOptions } from '@mui/material/styles'
import '@fontsource-variable/onest'

const theme = {
  palette: {
    primary: '#3D8FDA',
    secondary: '#759AFF',
    terciary: '#002382'
  }
}

export const getTheme = (mode: PaletteMode) => ({
  palette: {
    mode,
    typography: {
      fontFamily: 'Onest, Roboto, Poppins',
      h6: {
        fontFamily: 'Onest'
      },
      subtitle1: {
        fontFamily: 'Onest'
      },
      subtitle2: {
        fontFamily: 'Onest'
      },
      body1: {
        fontFamily: 'Onest'
      },
      body2: {
        fontFamily: 'Onest'
      }
    },
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: {
            main: '#3D8FDA',
            contrastText: '#fff'
          },
          secondary: {
            main: '#91caf2'
          } as PaletteColorOptions,
          accent: {
            main: '#002382'
          } as PaletteColorOptions,
          background: {
            paper: '#fff'
          },
          text: {
            primary: '#14181b',
            secondary: '#57636c'
          }
        }
      : {
          // palette values for dark mode
          primary: {
            main: '#759AFF'
          } as PaletteColorOptions,
          secondary: {
            main: '#90aae8'
          } as PaletteColorOptions,
          accent: {
            main: '#91caf2'
          } as PaletteColorOptions,
          background: {
            paper: '#14181b'
          },
          text: {
            primary: '#fff',
            secondary: '#95a1ac'
          }
        })
  }
})

export default theme

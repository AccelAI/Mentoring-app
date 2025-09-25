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
  // Component-specific style overrides
  components: {
    // Override Checkbox disabled styles - look like normal enabled components
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            WebkitTextFillColor: mode === 'light' ? '#14181b' : '#fff',
            color: 'inherit', // Use the same color as enabled state
            opacity: 1, // Full opacity like enabled components
            cursor: 'default' // Show default cursor instead of not-allowed
          }
        }
      }
    },
    // Override Radio disabled styles - look like normal enabled components
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            WebkitTextFillColor: mode === 'light' ? '#14181b' : '#fff',
            color: 'inherit', // Use the same color as enabled state
            opacity: 1, // Full opacity like enabled components
            cursor: 'default' // Show default cursor instead of not-allowed
          }
        }
      }
    },
    // Override TextField disabled styles - look like normal enabled components
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .Mui-disabled': {
            backgroundColor: 'transparent', // Same background as enabled
            cursor: 'default',
            '& .MuiInputBase-input': {
              color: mode === 'light' ? '#14181b' : '#fff', // Same as your text.primary
              WebkitTextFillColor: mode === 'light' ? '#14181b' : '#fff',
              cursor: 'default'
            },
            '& .MuiInputLabel-root': {
              color: mode === 'light' ? '#57636c' : '#95a1ac' // Same as your text.secondary
            }
          }
        }
      }
    },
    // Override Select disabled styles - look like normal enabled components
    MuiSelect: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            backgroundColor: 'transparent', // Same background as enabled
            color: mode === 'light' ? '#14181b' : '#fff', // Same as your text.primary
            cursor: 'default',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor:
                mode === 'light'
                  ? 'rgba(0, 0, 0, 0.23)'
                  : 'rgba(255, 255, 255, 0.23)' // MUI default border
            },
            '& .MuiSelect-icon': {
              color:
                mode === 'light'
                  ? 'rgba(0, 0, 0, 0.54)'
                  : 'rgba(255, 255, 255, 0.54)' // MUI default icon color
            }
          }
        }
      }
    },
    // Override FormControl disabled styles - look like normal enabled components
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .Mui-disabled': {
            '& .MuiInputLabel-root': {
              color: mode === 'light' ? '#57636c' : '#95a1ac' // Same as your text.secondary
            }
          }
        }
      }
    },
    // Override FormControlLabel disabled styles to make text black
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            '& .MuiFormControlLabel-label': {
              color: mode === 'light' ? '#14181b' : '#fff', // Same as text.primary
              opacity: 1
            }
          }
        }
      }
    }
  },
  palette: {
    typography: {
      fontFamily: 'Onest',
      h1: {
        fontFamily: 'Onest'
      },
      h2: {
        fontFamily: 'Onest'
      },
      h3: {
        fontFamily: 'Onest'
      },
      h4: {
        fontFamily: 'Onest'
      },
      h5: {
        fontFamily: 'Onest'
      },
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
    mode,
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

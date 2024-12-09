import { PaletteMode } from "@mui/material"
import { PaletteColorOptions } from "@mui/material/styles"

const theme = {
  palette: {
    primary: "#3D8FDA",
    secondary: "#759AFF",
    terciary: "#002382"
  }
}

export const getTheme = (mode: PaletteMode) => ({
  palette: {
    mode,
    typography: {
      fontFamily: "Roboto, Poppins"
    },
    ...(mode === "light"
      ? {
          // palette values for light mode
          primary: {
            main: "#3D8FDA",
            contrastText: "#fff"
          },
          secondary: {
            main: "#759AFF"
          } as PaletteColorOptions,
          background: {
            paper: "#fff"
          },
          text: {
            primary: "#14181b",
            secondary: "#57636c"
          }
        }
      : {
          // palette values for dark mode
          primary: {
            main: "#759AFF"
          } as PaletteColorOptions,
          secondary: {
            main: "#002382"
          } as PaletteColorOptions,
          background: {
            paper: "#14181b"
          },
          text: {
            primary: "#fff",
            secondary: "#95a1ac"
          }
        })
  }
})

export default theme

import { createTheme, PaletteMode, PaletteOptions } from "@mui/material";
import theme, { getTheme } from "./index.tsx";
import { useMemo, useState } from "react";
import { responsiveFontSizes } from "@mui/material/styles";

export const useColorTheme = () => {
  const [mode, setMode] = useState<PaletteMode>("light");

  const toggleColorMode = () =>
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));

  const modifiedTheme = useMemo(() => createTheme(getTheme(mode)), [mode]);

  return {
    theme: responsiveFontSizes(modifiedTheme),
    mode,
    toggleColorMode,
  };
};

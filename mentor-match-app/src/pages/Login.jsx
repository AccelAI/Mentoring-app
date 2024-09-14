import {
  Container,
  Card,
  Button,
  Typography,
  Stack,
  TextField,
} from "@mui/material";
import { useThemeContext } from "../hooks/useTheme";
const Login = () => {
  const { mode, toggleColorMode } = useThemeContext();
  return (
    <Container>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "center",
          alignItems: "center",
          py: 5,
          textAlign: "center",
        }}
      >
        <Card sx={{ maxHeight: "100%", p: 3 }}>
          <Typography variant="h4">Sign Up</Typography>
          <Typography variant="body1">
            Let's create your account by filling out the form below.
          </Typography>
        </Card>
      </Stack>
    </Container>
  );
};

export default Login;

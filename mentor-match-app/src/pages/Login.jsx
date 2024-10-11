import { Button, Typography, Stack, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Google as GoogleIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon,
  X as XIcon,
  Height,
} from "@mui/icons-material";
import { useThemeContext } from "../hooks/useTheme";
import MainCard from "../components/MainCard";
import PasswordField from "../components/PasswordField";
import TextField from "../components/TextField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { LoadingButton } from "@mui/lab";
import { logIn, signInWithGoogle } from "../api/auth";
import { useSnackbar } from "notistack";

const initialValues = {
  email: "",
  password: "",
};

const schema = yup.object().shape({
  email: yup
    .string()
    .required("Please enter your email")
    .email("Invalid email"),
  password: yup.string().required("Please enter a password"),
});

const Login = () => {
  //const { mode, toggleColorMode } = useThemeContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const handleSignUp = () => {
    navigate("/signup");
  };

  const onSubmit = async (user, { setSubmitting }) => {
    setSubmitting(true);

    const res = await logIn(user);

    if (!res.ok) {
      setSubmitting(false);
      return enqueueSnackbar(res.error, { variant: "error" });
    }

    enqueueSnackbar("Welcome Back", { variant: "success" });
    navigate("/get-started");
  };

  const googleLogin = async () => {
    const res = await signInWithGoogle();
    if (!res.ok) {
      return enqueueSnackbar(
        "Failed to log in with Google. Please try again.",
        { variant: "error" }
      );
    }
    enqueueSnackbar("Welcome Back", { variant: "success" });
    navigate("/get-started");
  };

  return (
    <MainCard
      title={"Welcome Back!"}
      titleSize={"h4"}
      props={{ height: "100vh" }}
      enableContainer={true}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={2.5} sx={{ alignItems: "center", width: "100%" }}>
              <Typography variant="body1">Log in to your account</Typography>
              <TextField
                label="Email"
                name="email"
                type="email"
                variant="outlined"
                required
                sx={{ width: "100%" }}
              />
              <PasswordField
                label="Password"
                name="password"
                variant="outlined"
                required
                sx={{ width: "100%" }}
              />
              <LoadingButton
                variant="contained"
                type="submit"
                sx={{ width: "100%" }}
                loading={isSubmitting}
              >
                Log in
              </LoadingButton>

              <Divider>Or</Divider>
              <Stack spacing={1} sx={{ width: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GoogleIcon />}
                  sx={{ width: "100%" }}
                  onClick={googleLogin}
                >
                  Continue with Google
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<GitHubIcon />}
                  sx={{ width: "100%" }}
                >
                  Continue with Github
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FacebookIcon />}
                  sx={{ width: "100%" }}
                >
                  Continue with Facebook
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<XIcon />}
                  sx={{ width: "100%" }}
                >
                  Continue with X
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography>Don't have an account?</Typography>
                <Button onClick={handleSignUp} variant="text" color="primary">
                  Sign up here
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
};

export default Login;

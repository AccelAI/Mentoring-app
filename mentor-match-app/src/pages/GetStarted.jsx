import {
  Stack,
  Select,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  FormControlLabel,
  InputLabel,
  Button,
  Box,
  Stepper,
  Step,
  StepButton,
  StepLabel,
  Container,
  Switch,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Upload as UploadIcon } from "@mui/icons-material";
import { Form, Formik } from "formik";
import * as yup from "yup";
import MainCard from "../components/MainCard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialValues = {
  title: "",
  affiliation: "",
  location: "",
  identifyAs: "",
  profilePicture: "",
  profileDescription: "",
  websiteUrl: "",
  publicProfile: true,
};

const schema = yup.object().shape({
  title: yup.string().required("Please enter your title"),
  affiliation: yup.string().required("Please enter your affiliation"),
  profilePicture: yup.string().url("Invalid URL"),
  websiteUrl: yup.string().url("Invalid URL"),
  publicProfile: yup.boolean(),
});

const steps = ["1", "2", "3", "4"];

const GetStarted = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const fillFormLater = () => {
    handleDialogClose();
    handleNext();
  };

  const goToApplicationForm = () => {
    handleDialogClose();
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (activeStep === 3) {
      navigate("/dashboard");
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleStep = (index) => {
    setActiveStep(index);
  };

  const getTitle = () => {
    if (activeStep === 3) {
      return "Congrats, you've joined the private forum of the LatinX in AI network!";
    }
    return "Hi, Welcome to Latinx In AI (LXAI)!";
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Stack
        sx={{
          justifyContent: "center",
          alignItems: "center",
          width: 1,
          height: 1,
        }}
        mt={5}
        spacing={3}
      >
        <Stepper
          activeStep={activeStep}
          sx={{ width: { xl: "50%", md: "60%", sm: "100%" } }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              {index === 0 ? (
                <StepLabel />
              ) : (
                <StepButton onClick={() => handleStep(index)}>
                  <StepLabel />
                </StepButton>
              )}
            </Step>
          ))}
        </Stepper>
        <MainCard
          title={getTitle()}
          titleSize={"h4"}
          props={{ height: "100vh" }}
          enableContainer={false}
        >
          {activeStep === 1 && (
            <>
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                Becoming a new member only takes a minute.
              </Typography>
              <Box>
                <Stack spacing={2} mt={3.5}>
                  <Stack spacing={1}>
                    <Typography>
                      What is your professional Title and Affiliation?
                    </Typography>
                    <Stack direction="row" spacing={3.5}>
                      <TextField
                        label="Title"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                      <TextField
                        label="Affiliation"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      />
                    </Stack>
                  </Stack>
                  <Stack spacing={1}>
                    <Typography>
                      What is your City, State, Country of Origin?
                    </Typography>
                    <TextField
                      label="Origin Location"
                      variant="outlined"
                      sx={{ width: "100%" }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography>
                      Do you identify as LatinX or as an ally?
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel id="select-label">
                        Select an Option
                      </InputLabel>
                      <Select
                        label="Select an Option"
                        variant="outlined"
                        sx={{ width: "100%" }}
                      >
                        <MenuItem value="latinx">LatinX</MenuItem>
                        <MenuItem value="ally">Ally</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                  <Button variant="contained" onClick={handleNext}>
                    Continue
                  </Button>
                </Stack>
              </Box>
            </>
          )}
          {activeStep === 2 && (
            <Box>
              <Stack spacing={2} mt={3.5}>
                <Stack spacing={3} direction="row" alignItems="center">
                  <Stack>
                    <Box
                      component="img"
                      src={
                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                      }
                      sx={{ height: "150px", width: "150px" }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Typography>Upload a profile picture</Typography>
                    <Button variant="contained" startIcon={<UploadIcon />}>
                      Load Image
                    </Button>
                    <Typography variant="caption">
                      If a profile picture isn't uploaded, a default one will be
                      used
                    </Typography>
                  </Stack>
                </Stack>
                <Stack spacing={1}>
                  <Typography>Add a short bio or tagline</Typography>
                  <TextField
                    label="Profile Description"
                    variant="outlined"
                    sx={{ width: "100%" }}
                  />
                </Stack>
                <Stack spacing={1}>
                  <Typography>Do you have a professional website?</Typography>
                  <TextField
                    label="Url"
                    variant="outlined"
                    sx={{ width: "100%" }}
                  />
                </Stack>
                <Stack spacing={1}>
                  <Typography>
                    Do you want to be listed on our public directory for
                    collaboration, mentoring, speaking, or hiring opportunities?
                  </Typography>
                  <FormControlLabel
                    control={<Switch />}
                    label="Public Profile"
                  />
                </Stack>
                <Button variant="contained" onClick={handleDialogOpen}>
                  Continue
                </Button>
              </Stack>
            </Box>
          )}
          {activeStep === 3 && (
            <Stack spacing={2}>
              <Typography variant="body1" sx={{ textAlign: "center" }}>
                This space has been created for latinx identifying students,
                post-docs, academic researchers, industry researchers, and alies
                working in Artificial Intelligence and Machine Learning
              </Typography>
              <Button
                onClick={handleNext}
                variant="contained"
                sx={{ width: "30%", alignSelf: "end" }}
              >
                Finish
              </Button>
            </Stack>
          )}
          <Dialog open={openDialog} onClose={handleDialogClose}>
            <DialogTitle textAlign="center">
              {
                "Which role best matches your interest in our Mentorship Program?"
              }
            </DialogTitle>
            <DialogContent sx={{ alignSelf: "center" }}>
              <FormControl>
                <RadioGroup row name="form-radio-options">
                  <FormControlLabel
                    value="mentee"
                    control={<Radio />}
                    label="Mentee"
                  />
                  <FormControlLabel
                    value="mentor"
                    control={<Radio />}
                    label="Mentor"
                  />
                  <FormControlLabel
                    value="both"
                    control={<Radio />}
                    label="Both"
                  />
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "space-between", m: 1 }}>
              <Button onClick={fillFormLater}>
                Fill Application Form Later
              </Button>
              <Button
                variant="contained"
                onClick={goToApplicationForm}
                autoFocus
              >
                Go to Application Form
              </Button>
            </DialogActions>
          </Dialog>
        </MainCard>
      </Stack>
    </Container>
  );
};

export default GetStarted;

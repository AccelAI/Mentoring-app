import { Container, Box, Typography, Card, Stack } from "@mui/material";
import TextField from "./TextField";
import { Field } from "formik";

const TextfieldQuestion = ({
  name,
  question,
  description,
  required = true,
}) => {
  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <Stack spacing={0.75}>
        <Typography variant="h6">{question}</Typography>
        {description && <Typography variant="body2">{description}</Typography>}
        <Field
          as={TextField}
          label="Your answer"
          name={name}
          variant="standard"
          required={required}
        />
      </Stack>
    </Card>
  );
};

export default TextfieldQuestion;

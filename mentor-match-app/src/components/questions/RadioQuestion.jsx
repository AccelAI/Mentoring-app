import {
  Container,
  Box,
  Typography,
  Card,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { Field } from "formik";

const RadioQuestion = ({
  name,
  question,
  description,
  options,
  required = true,
}) => {
  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <Stack spacing={1}>
        <FormControl required={required}>
          <FormLabel
            component={Typography}
            variant="h6"
            sx={{ color: "#000", fontWeight: "500" }}
          >
            {question}
          </FormLabel>
          <Typography variant="body2">{description}</Typography>
          <Field name={name}>
            {({ field }) => (
              <RadioGroup {...field}>
                {options.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            )}
          </Field>
        </FormControl>
      </Stack>
    </Card>
  );
};

export default RadioQuestion;

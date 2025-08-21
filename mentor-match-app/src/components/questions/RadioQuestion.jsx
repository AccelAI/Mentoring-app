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
  FormHelperText
} from '@mui/material'
import { Field, ErrorMessage } from 'formik'

const RadioQuestion = ({
  name,
  question,
  description,
  options,
  required = true,
  disabled = false
}) => {
  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <FormControl required={required}>
        <Stack spacing={0.75}>
          <FormLabel
            component={Typography}
            variant="h6"
            sx={{ color: '#000', fontWeight: '500' }}
          >
            {question}
          </FormLabel>
          {description && (
            <Typography variant="body2">{description}</Typography>
          )}
          <Field name={name}>
            {({ field }) => (
              <RadioGroup {...field}>
                {options.map((option) => (
                  <FormControlLabel
                    key={option}
                    value={option}
                    control={<Radio disabled={disabled} />}
                    label={option}
                  />
                ))}
              </RadioGroup>
            )}
          </Field>
          <ErrorMessage name={name}>
            {(msg) => <FormHelperText error>{msg}</FormHelperText>}
          </ErrorMessage>
        </Stack>
      </FormControl>
    </Card>
  )
}

export default RadioQuestion

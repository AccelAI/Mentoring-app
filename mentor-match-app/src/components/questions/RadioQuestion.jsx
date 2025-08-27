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
import { formatDescription } from '../../utils/formatDescription'

const RadioQuestion = ({
  name,
  question,
  description,
  options,
  required = true,
  spacing = 0
}) => {
  const formattedDescription = description
    ? formatDescription(description)
    : null

  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <FormControl required={required}>
        <Stack spacing={0.75}>
          <FormLabel
            component={Typography}
            sx={{ color: '#000', fontWeight: '450' }}
          >
            {question}
          </FormLabel>
          {formattedDescription && (
            <Typography variant="body2" sx={{ pb: 1 }}>
              {formattedDescription}
            </Typography>
          )}
          <Field name={name}>
            {({ field }) => (
              <RadioGroup {...field}>
                <Stack spacing={spacing}>
                  {options.map((option) => (
                    <FormControlLabel
                      key={option}
                      value={option}
                      control={<Radio />}
                      label={option}
                    />
                  ))}
                </Stack>
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

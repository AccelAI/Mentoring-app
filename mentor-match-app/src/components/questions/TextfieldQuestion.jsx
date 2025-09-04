import {
  Typography,
  Card,
  Stack,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  Link,
  Box
} from '@mui/material'
import TextField from '../inputFields/TextField'
import { Field, ErrorMessage, useFormikContext } from 'formik'
import { formatDescription } from '../../utils/formatDescription'

const TextfieldQuestion = ({
  name,
  question,
  description,
  required = true,
  disabled = false
}) => {
  const { values } = useFormikContext()
  const fieldValue = values[name]
  const formattedDescription = description
    ? formatDescription(description)
    : null

  // Show link if disabled and value is a valid URL
  if (disabled && fieldValue && isValidUrl(fieldValue)) {
    return (
      <Card sx={{ p: 2 }} variant="outlined">
        <Stack spacing={0.75}>
          <Typography variant="h6">{question}</Typography>
          {formattedDescription && (
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Answer:
            </Typography>
            <Link
              href={fieldValue}
              target="_blank"
              rel="noopener noreferrer"
              variant="body1"
              sx={{ wordBreak: 'break-all' }}
            >
              {fieldValue}
            </Link>
          </Box>
        </Stack>
      </Card>
    )
  }

  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <FormControl
        required={required}
        sx={{
          width: '100%',
          '& .MuiFormLabel-asterisk': { color: 'error.main' }
        }}
      >
        <Stack spacing={0.75}>
          <FormLabel
            component={Typography}
            sx={{ color: '#000', fontWeight: '450' }}>
            {question}
          </FormLabel>
          {formattedDescription && (
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <Field
            as={TextField}
            label={disabled ? 'Answer' : 'Your answer'}
            name={name}
            variant="standard"
            required={required}
            disabled={disabled}
          />
        </Stack>
      </FormControl>
    </Card>
  )
}

export default TextfieldQuestion

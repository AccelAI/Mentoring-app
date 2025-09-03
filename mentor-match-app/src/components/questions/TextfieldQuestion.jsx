import {
  Typography,
  Card,
  Stack,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel
} from '@mui/material'
import TextField from '../inputFields/TextField'
import { Field, ErrorMessage } from 'formik'
import { formatDescription } from '../../utils/formatDescription'

const TextfieldQuestion = ({
  name,
  question,
  description,
  required = true
}) => {
  const formattedDescription = description
    ? formatDescription(description)
    : null

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
            sx={{ color: '#000', fontWeight: '450' }}
          >
            {question}
          </FormLabel>
          {formattedDescription && (
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <Field
            as={TextField}
            label="Your answer"
            name={name}
            variant="standard"
          />
        </Stack>
      </FormControl>
    </Card>
  )
}

export default TextfieldQuestion

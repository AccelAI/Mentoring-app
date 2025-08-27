import {
  Card,
  Typography,
  Stack,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel
} from '@mui/material'
import CheckboxField from '../inputFields/CheckboxField'
import { FieldArray, ErrorMessage } from 'formik'
import { formatDescription } from '../../utils/formatDescription'

const CheckboxQuestion = ({
  name,
  question,
  description,
  options,
  required = true
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
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <FieldArray name={name}>
            {({ form, push, remove }) => {
              const fieldValue = form.values[name] || []
              return (
                <FormGroup>
                  {options.map((option) => (
                    <CheckboxField
                      key={option}
                      name={name}
                      value={option}
                      label={option}
                      checked={fieldValue.includes(option)}
                      onChange={() => {
                        if (fieldValue.includes(option)) {
                          const idx = fieldValue.indexOf(option)
                          remove(idx)
                        } else {
                          push(option)
                        }
                      }}
                    />
                  ))}
                </FormGroup>
              )
            }}
          </FieldArray>
          <ErrorMessage name={name}>
            {(msg) => <FormHelperText error>{msg}</FormHelperText>}
          </ErrorMessage>
        </Stack>
      </FormControl>
    </Card>
  )
}

export default CheckboxQuestion

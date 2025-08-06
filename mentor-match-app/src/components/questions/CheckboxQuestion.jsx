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

const CheckboxQuestion = ({
  name,
  question,
  description,
  options,
  required = true
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

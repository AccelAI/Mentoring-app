import {
  Card,
  Typography,
  Stack,
  FormControl,
  FormHelperText,
  FormLabel
} from '@mui/material'
import TimezoneSelect from '../inputFields/TimezoneSelect'
import { Field, ErrorMessage } from 'formik'

const TimezoneQuestion = ({ name, question, description, required = true }) => {
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
            <Typography variant="body2" sx={{ pb: 1.5 }}>
              {description}
            </Typography>
          )}
          <Field name={name}>
            {({ field, form }) => (
              <TimezoneSelect
                name={name}
                values={form.values}
                setFieldValue={form.setFieldValue}
              />
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

export default TimezoneQuestion

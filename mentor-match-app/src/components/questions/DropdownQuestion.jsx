import {
  Typography,
  Card,
  Stack,
  FormControl,
  FormLabel,
  FormHelperText,
  TextField,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import { Field, ErrorMessage } from 'formik'
import { formatDescription } from '../../utils/formatDescription'
import { useState } from 'react'

const DropdownQuestion = ({
  name,
  question,
  description,
  options,
  required = true,
  disabled = false,
  spacing = 0
}) => {
  const formattedDescription = description
    ? formatDescription(description)
    : null
  const [isOtherSelected, setIsOtherSelected] = useState(false)

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
            sx={{ color: '#000', fontWeight: '500' }}
          >
            {question}
          </FormLabel>
          {formattedDescription && (
            <Typography variant="body2" sx={{ pb: 1 }}>
              {formattedDescription}
            </Typography>
          )}
          <Field name={name}>
            {({ field, form }) => {
              const nonOtherOptions = options.filter((o) => o !== 'Other')
              const fieldValue = form.values[name]
              const selectValue = isOtherSelected
                ? 'Other'
                : typeof fieldValue === 'string' &&
                  nonOtherOptions.includes(fieldValue)
                ? fieldValue
                : typeof fieldValue === 'string' && fieldValue
                ? 'Other'
                : ''
              const showOtherError =
                selectValue === 'Other' &&
                (fieldValue === undefined ||
                  fieldValue === null ||
                  (typeof fieldValue === 'string' && fieldValue.trim() === ''))

              return (
                <Stack spacing={1}>
                  <FormControl
                    fullWidth
                    disabled={disabled}
                    variant="outlined"
                    size="small"
                  >
                    <InputLabel id={`${name}-label`}>{question}</InputLabel>
                    <Select
                      labelId={`${name}-label`}
                      label={question}
                      name={field.name}
                      value={selectValue}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === 'Other') {
                          setIsOtherSelected(true)
                          if (
                            typeof form.values[name] === 'string' &&
                            nonOtherOptions.includes(form.values[name])
                          ) {
                            form.setFieldValue(name, '')
                          }
                        } else {
                          setIsOtherSelected(false)
                          form.setFieldValue(name, v)
                        }
                      }}
                    >
                      <MenuItem value="">
                        <em>Select an option</em>
                      </MenuItem>
                      {options.map((option) => (
                        <MenuItem
                          key={option}
                          value={option === 'Other' ? 'Other' : option}
                        >
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {selectValue === 'Other' && (
                    <TextField
                      name={name}
                      value={form.values[name] || ''}
                      onChange={(e) => form.setFieldValue(name, e.target.value)}
                      placeholder="Please specify"
                      size="small"
                      fullWidth
                      required={required}
                      error={showOtherError}
                      disabled={disabled}
                      helperText={
                        showOtherError
                          ? 'Please specify your answer for "Other".'
                          : ''
                      }
                    />
                  )}
                </Stack>
              )
            }}
          </Field>
          <ErrorMessage name={name}>
            {(msg) => <FormHelperText error>{msg}</FormHelperText>}
          </ErrorMessage>
        </Stack>
      </FormControl>
    </Card>
  )
}

export default DropdownQuestion

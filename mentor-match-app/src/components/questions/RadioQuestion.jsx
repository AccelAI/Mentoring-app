import {
  Typography,
  Card,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  TextField
} from '@mui/material'
import { Field, ErrorMessage } from 'formik'
import { formatDescription } from '../../utils/formatDescription'
import { useState } from 'react'

const RadioQuestion = ({
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
  // Track if "Other" is selected so radio stays selected while editing
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
              const radioValue = isOtherSelected
                ? 'Other'
                : typeof fieldValue === 'string' &&
                  nonOtherOptions.includes(fieldValue)
                ? fieldValue
                : typeof fieldValue === 'string' && fieldValue
                ? 'Other'
                : ''
              const showOtherError =
                radioValue === 'Other' &&
                (fieldValue === undefined ||
                  fieldValue === null ||
                  (typeof fieldValue === 'string' && fieldValue.trim() === ''))
              return (
                <RadioGroup
                  name={field.name}
                  value={radioValue}
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
                  <Stack spacing={spacing}>
                    {options.map((option) =>
                      option === 'Other' ? (
                        <Stack key={option} spacing={1}>
                          <FormControlLabel
                            value="Other"
                            control={<Radio disabled={disabled} />}
                            label="Other"
                            sx={{ marginLeft: '-11px !important' }}
                          />
                          {radioValue === 'Other' && (
                            <>
                              <TextField
                                name={name}
                                value={form.values[name] || ''}
                                onChange={(e) =>
                                  form.setFieldValue(name, e.target.value)
                                }
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
                            </>
                          )}
                        </Stack>
                      ) : (
                        <FormControlLabel
                          key={option}
                          value={option}
                          control={<Radio disabled={disabled} />}
                          label={option}
                        />
                      )
                    )}
                  </Stack>
                </RadioGroup>
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

export default RadioQuestion

import {
  Card,
  Typography,
  Stack,
  FormControl,
  FormGroup,
  FormHelperText,
  FormLabel,
  TextField
} from '@mui/material'
import CheckboxField from '../inputFields/CheckboxField'
import { FieldArray, ErrorMessage } from 'formik'
import { formatDescription } from '../../utils/formatDescription'
import { useState } from 'react' // added

const CheckboxQuestion = ({
  name,
  question,
  description,
  options,
  spacing,
  required = true,
  disabled = false
}) => {
  const formattedDescription = description
    ? formatDescription(description)
    : null
  // UI state to keep "Other" checked while editing and hold transient input
  const [uiOtherActive, setUiOtherActive] = useState(false)
  const [otherInput, setOtherInput] = useState('')

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
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <FieldArray name={name}>
            {({ form, push, remove, replace }) => {
              const fieldValue = form.values[name] || []
              const nonOtherOptions = options.filter((o) => o !== 'Other')
              const existingOther =
                fieldValue.find((v) => !nonOtherOptions.includes(v)) || ''
              const isOtherChecked = uiOtherActive || Boolean(existingOther)
              const otherValue =
                uiOtherActive && !existingOther ? otherInput : existingOther

              // Show error if "Other" is checked but empty
              const showOtherError =
                isOtherChecked && (!otherValue || otherValue.trim() === '')

              return (
                <FormGroup>
                  <Stack spacing={spacing}>
                    {options.map((option) =>
                      option === 'Other' ? (
                        <Stack key={option} spacing={1}>
                          <CheckboxField
                            name={name}
                            value={option}
                            label={option}
                            checked={isOtherChecked}
                            disabled={disabled}
                            onChange={() => {
                              if (isOtherChecked) {
                                // Uncheck: remove any custom value and clear UI state
                                const arr = form.values[name] || []
                                const idx = arr.findIndex(
                                  (v) => !nonOtherOptions.includes(v)
                                )
                                if (idx !== -1) remove(idx)
                                setUiOtherActive(false)
                                setOtherInput('')
                              } else {
                                // Check: activate UI, don't store literal 'Other'
                                setUiOtherActive(true)
                                // if there is already a custom value (from initial data), keep it
                              }
                            }}
                            sx={{ marginLeft: '-11px !important' }}
                          />
                          {isOtherChecked && (
                            <>
                              <TextField
                                name={`${name}__other`} // avoid clashing with the array field
                                value={otherValue}
                                onChange={(e) => {
                                  const val = e.target.value
                                  setOtherInput(val)
                                  // Remove previous custom value
                                  const arr = form.values[name] || []
                                  const prevIdx = arr.findIndex(
                                    (v) => !nonOtherOptions.includes(v)
                                  )
                                  if (prevIdx !== -1) {
                                    // Replace the previous custom value
                                    if (val) {
                                      replace(prevIdx, val)
                                    } else {
                                      remove(prevIdx)
                                    }
                                  } else if (val) {
                                    // Add new custom value
                                    push(val)
                                  }
                                }}
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
                        <CheckboxField
                          key={option}
                          name={name}
                          value={option}
                          label={option}
                          disabled={disabled}
                          checked={fieldValue.includes(option)}
                          onChange={() => {
                            const idx = fieldValue.indexOf(option)
                            if (idx !== -1) {
                              remove(idx)
                            } else {
                              push(option)
                            }
                          }}
                        />
                      )
                    )}
                  </Stack>
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

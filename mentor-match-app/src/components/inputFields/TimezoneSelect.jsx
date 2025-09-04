import React from 'react'
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import timezones from '../../assets/timezones.json'

const TimezoneSelect = ({
  values,
  setFieldValue,
  name,
  variant = 'standard',
  size = 'regular',
  disabled = false
}) => {
  // Extract unique GMT codes
  const uniqueGmtCodes = Array.from(new Set(timezones.map((tz) => tz.gmt)))

  return (
    <FormControl fullWidth>
      <InputLabel>Select a Timezone</InputLabel>
      <Select
        label="Select a Timezone"
        variant={variant}
        size={size}
        name={name}
        value={values[name] || ''}
        onChange={(event) => {
          setFieldValue(name, event.target.value)
        }}
        disabled={disabled}
      >
        {uniqueGmtCodes.map((gmt) => (
          <MenuItem key={gmt} value={gmt}>
            {gmt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default TimezoneSelect

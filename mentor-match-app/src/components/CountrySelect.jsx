import React from 'react'
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import countries from '../assets/countries.json'

const CountrySelect = ({
  values,
  setFieldValue,
  name,
  variant = 'outlined',
  size = 'regular'
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel>Select a Country</InputLabel>
      <Select
        label="Select a Country"
        variant={variant}
        size={size}
        sx={{ width: '100%' }}
        name={name}
        value={values[name]}
        onChange={(event) => {
          setFieldValue(name, event.target.value)
        }}
      >
        {countries.map((country) => (
          <MenuItem key={country.name} value={country.name}>
            {country.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

export default CountrySelect

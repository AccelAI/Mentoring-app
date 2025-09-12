import React from 'react'
import { TextField, IconButton, Box, InputAdornment } from '@mui/material'
import { Search } from '@mui/icons-material'

const SearchBar = ({ setSearchQuery, props }) => (
  <form>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TextField
        id="search-bar"
        className="text"
        onInput={(e) => {
          setSearchQuery(e.target.value)
        }}
        variant="standard"
        size="small"
        placeholder="Search..."
        sx={{ ...props }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" aria-label="search" size="small">
                  <Search />
                </IconButton>
              </InputAdornment>
            )
          }
        }}
      />
    </Box>
  </form>
)

export default SearchBar

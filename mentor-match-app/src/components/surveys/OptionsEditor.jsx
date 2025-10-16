import {
  Stack,
  Checkbox,
  Radio,
  IconButton,
  TextField,
  Button,
  Typography
} from '@mui/material'
import { Close as DeleteIcon } from '@mui/icons-material'
import { useEffect, useState } from 'react'

const OptionsEditor = ({
  questionType,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  updateOptions = () => {},
  currentOptions = []
}) => {
  const [options, setOptions] = useState(currentOptions)

  useEffect(() => {
    setOptions(currentOptions || [])
  }, [currentOptions])

  const handleAddOption = () => {
    const newOptions = [...options, 'Option ' + (options.length + 1)]
    setOptions(newOptions)
    updateOptions(newOptions)
  }

  const handleOptionChange = (index, value) => {
    const newOptions = options.map((opt, i) => (i === index ? value : opt))
    setOptions(newOptions)
    updateOptions(newOptions)
  }

  const handleDeleteOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index)
    setOptions(newOptions)
    updateOptions(newOptions)
  }

  return (
    <Stack spacing={2}>
      <Typography color="text.secondary">Options</Typography>
      <Stack spacing={1}>
        {options.map((option, index) => (
          <Stack key={index} direction="row" spacing={1} alignItems="center">
            {questionType === 'checklist' && (
              <Checkbox
                disabled
                sx={{ '&.Mui-disabled': { color: 'lightgray' } }}
              />
            )}
            {questionType === 'radio' && (
              <Radio
                disabled
                sx={{ '&.Mui-disabled': { color: 'lightgray' } }}
              />
            )}
            <TextField
              variant="standard"
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              fullWidth
            />
            <IconButton onClick={() => handleDeleteOption(index)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        ))}
        <Button size="small" onClick={handleAddOption}>
          Add Option
        </Button>
      </Stack>
    </Stack>
  )
}

export default OptionsEditor

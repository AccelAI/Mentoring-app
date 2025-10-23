import {
  Card,
  Typography,
  Stack,
  TextField,
  FormControlLabel,
  Radio,
  MenuItem,
  Checkbox
} from '@mui/material'

const QuestionPreview = ({ questionData, isCurrentQuestion }) => {
  if (!questionData) return null
  const { title, description, type, options, isRequired } = questionData

  return (
    <Card
      sx={{
        p: 2,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease'
      }}
      variant={isCurrentQuestion ? 'elevation' : 'outlined'}
      elevation={4}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={0.7}>
          <Typography variant="subtitle1" lineHeight={1.5}>
            {title}
          </Typography>
          {isRequired && (
            <Typography variant="subtitle1" color="error">
              *
            </Typography>
          )}
        </Stack>
        {description !== '' && (
          <Typography variant="body2">{description}</Typography>
        )}
        {type === 'text' && (
          <TextField
            variant="standard"
            fullWidth
            label="Answer text"
            disabled
          />
        )}
        <Stack>
          {type === 'checklist' &&
            options &&
            options.map((option, index) => (
              <Stack key={index} direction="row" alignItems="center">
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled
                      sx={{ '&.Mui-disabled': { color: 'gray' } }}
                    />
                  }
                  label={option}
                />
              </Stack>
            ))}
          {type === 'radio' &&
            options &&
            options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Radio
                    disabled
                    sx={{ '&.Mui-disabled': { color: 'gray' } }}
                  />
                }
                label={option}
              />
            ))}
          {type === 'dropdown' && (
            <TextField
              select
              variant="standard"
              fullWidth
              label={'Select an option'}
            >
              {options &&
                options.map((option, index) => (
                  <MenuItem key={index} value={option} disabled>
                    {option}
                  </MenuItem>
                ))}
            </TextField>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}

export default QuestionPreview

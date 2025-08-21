import { Typography, Card, Stack, Link, Box } from '@mui/material'
import TextField from '../inputFields/TextField'
import { Field, useFormikContext } from 'formik'
import React from 'react'

const TextfieldQuestion = ({
  name,
  question,
  description,
  required = true,
  disabled = false
}) => {
  const { values } = useFormikContext()
  const fieldValue = values[name]

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const formatDescription = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer">
            {part}
          </a>
        )
      }
      return part
    })

    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {typeof part === 'string'
          ? part.split('\n').map((line, lineIndex) => (
              <React.Fragment key={`${index}-${lineIndex}`}>
                {line}
                {lineIndex < part.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))
          : part}
      </React.Fragment>
    ))
  }

  const formattedDescription = description
    ? formatDescription(description)
    : null

  // Show link if disabled and value is a valid URL
  if (disabled && fieldValue && isValidUrl(fieldValue)) {
    return (
      <Card sx={{ p: 2 }} variant="outlined">
        <Stack spacing={0.75}>
          <Typography variant="h6">{question}</Typography>
          {formattedDescription && (
            <Typography variant="body2">{formattedDescription}</Typography>
          )}
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Answer:
            </Typography>
            <Link
              href={fieldValue}
              target="_blank"
              rel="noopener noreferrer"
              variant="body1"
              sx={{ wordBreak: 'break-all' }}
            >
              {fieldValue}
            </Link>
          </Box>
        </Stack>
      </Card>
    )
  }

  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <Stack spacing={0.75}>
        <Typography variant="h6">{question}</Typography>
        {formattedDescription && (
          <Typography variant="body2">{formattedDescription}</Typography>
        )}
        <Field
          as={TextField}
          label={disabled ? 'Answer' : 'Your answer'}
          name={name}
          variant="standard"
          required={required}
          disabled={disabled}
        />
      </Stack>
    </Card>
  )
}

export default TextfieldQuestion

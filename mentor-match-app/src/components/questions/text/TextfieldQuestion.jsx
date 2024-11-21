import { Typography, Card, Stack } from '@mui/material'
import TextField from './TextField'
import { Field } from 'formik'
import React from 'react'

const TextfieldQuestion = ({
  name,
  question,
  description,
  required = true
}) => {
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

  return (
    <Card sx={{ p: 2 }} variant="outlined">
      <Stack spacing={0.75}>
        <Typography variant="h6">{question}</Typography>
        {formattedDescription && (
          <Typography variant="body2">{formattedDescription}</Typography>
        )}
        <Field
          as={TextField}
          label="Your answer"
          name={name}
          variant="standard"
          required={required}
        />
      </Stack>
    </Card>
  )
}

export default TextfieldQuestion

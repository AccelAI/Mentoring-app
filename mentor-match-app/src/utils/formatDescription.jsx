import React from 'react'

export const formatDescription = (text) => {
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

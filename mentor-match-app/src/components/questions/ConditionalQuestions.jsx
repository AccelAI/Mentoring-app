import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { Box, Stack, Typography } from '@mui/material'
import RadioQuestion from './RadioQuestion'

/* Component for the conditional questions that are part of the 3 forms (mentee, mentors and mentee-mentor) */
const ConditionalQuestions = () => {
  const { values, setFieldValue } = useFormikContext()
  const { mentorArea, menteeMotivation } = values

  useEffect(() => {
    if (!mentorArea && !menteeMotivation) return
    // Reset fields if "Improve as a Reviewer of Research Papers" is removed from mentorArea or menteeMotivation
    if (
      (mentorArea &&
        !mentorArea.includes('Improve as a Reviewer of Research Papers')) ||
      (menteeMotivation &&
        !menteeMotivation.includes('Improve as a Reviewer of Research Papers'))
    ) {
      const fieldsToReset = [
        'reviewerInWorkshop',
        'publicationsInWorkshop',
        'reviewerInAiConferences',
        'publicationsInAiConferences',
        'reviewerInAiJournals',
        'publicationsInAiJournals'
      ]
      // Reset fields only if they exist in the form
      fieldsToReset.forEach((field) => {
        if (values.hasOwnProperty(field)) {
          setFieldValue(field, '')
        }
      })
    }
  }, [mentorArea, menteeMotivation, setFieldValue, values])

  const renderRadioQuestions = () => {
    const questions = [
      {
        question:
          'Have you served as a reviewer in a research workshop before?',
        description: '',
        name: 'reviewerInWorkshop',
        options: ['Never', '1-2 Times', '3-5 Times', 'More than 5 times']
      },
      {
        question: 'Do you have peer-reviewed publications in workshop(s)?',
        description: '',
        name: 'publicationsInWorkshop',
        options: ['Yes', 'No']
      },
      {
        question: 'Have you served as a reviewer in top-tier AI conferences?',
        description:
          'Examples include CVPR / ICCV / ECCV / NeurIPS / ICML / ACL / ICLR',
        name: 'reviewerInAiConferences',
        options: ['Never', '1-2 Times', '3-5 Times', 'More than 5 times']
      },
      {
        question:
          'Do you have peer-reviewed publications in top-tier AI conferences?',
        description:
          'Examples include CVPR / ICCV / ECCV / NeurIPS / ICML / ACL / ICLR',
        name: 'publicationsInAiConferences',
        options: ['Yes', 'No']
      },
      {
        question:
          'Have you served as a reviewer in AI journals of high impact?',
        description: '',
        name: 'reviewerInAiJournals',
        options: ['Never', '1-2 Times', '3-5 Times', 'More than 5 times']
      },
      {
        question:
          'Do you have peer-reviewed publications in AI journals of high impact?',
        description: '',
        name: 'publicationsInAiJournals',
        options: ['Yes', 'No']
      }
    ]

    return questions.map((q, index) => (
      <RadioQuestion
        key={index}
        question={q.question}
        description={q.description}
        name={q.name}
        options={q.options}
        required={true}
      />
    ))
  }

  const shouldRenderSection =
    mentorArea?.includes('Improve as a Reviewer of Research Papers') ||
    menteeMotivation?.includes('Improve as a Reviewer of Research Papers')

  return (
    <>
      {shouldRenderSection && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Reviewing Research Papers</Typography>
            <Typography>
              Only for those who checked this option on the mentoring
              preferences
            </Typography>
          </Box>
          {renderRadioQuestions()}
        </Stack>
      )}
    </>
  )
}

export default ConditionalQuestions

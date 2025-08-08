import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { Box, Stack, Typography } from '@mui/material'
import CheckboxQuestion from './CheckboxQuestion'

/* Component for the conditional questions that are part of the Mentor form */
const ConditionalQuestionsMentor = () => {
  const { values, setFieldValue } = useFormikContext()
  const { mentorArea } = values

  useEffect(() => {
    if (!mentorArea) return
    // Reset fields if "Strengthening skills" is removed from mentorArea
    if (
      !mentorArea.includes(
        'Strengthening skills (Writing or Communication or Engineering)'
      )
    ) {
      setFieldValue('mentorSkills', [])
    }

    // Reset fields if "Research Guidance" is removed from mentorArea
    if (!mentorArea.includes('Research Guidance (AI Verticals)')) {
      setFieldValue('areasConsideringMentoring', [])
    }
  }, [mentorArea, setFieldValue])

  return (
    <>
      {mentorArea.includes(
        'Strengthening skills (Writing or Communication or Engineering)'
      ) && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Strengthening Skills</Typography>
            <Typography>
              Only for those who checked this option on the mentoring
              preferences
            </Typography>
          </Box>
          <CheckboxQuestion
            question="What skills do you want to help mentees to improve?"
            description=""
            name="mentorSkills"
            options={[
              'Presenting (Verbal Communication of research)',
              'Writing Research Papers',
              'Finding papers related to my area of research',
              'Engineering to improve research outcomes'
            ]}
            required={true}
          />
        </Stack>
      )}
      {mentorArea.includes('Research Guidance (AI Verticals)') && (
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">
              Research Guidance (AI Verticals)
            </Typography>
            <Typography>
              Only for those who checked this option on the mentoring
              preferences
            </Typography>
          </Box>
          <CheckboxQuestion
            question="What are the research areas you can consider mentoring?"
            description="Choose up to 3 options | Elija hasta 3 opciones | Escolha até 3 opções"
            name="areasConsideringMentoring"
            options={[
              'Reinforcement Learning',
              'Deep Learning (Architectures / Datasets / Evaluation)',
              'Learning Theory (Bandits / Experts / Game Theory)',
              'Probabilistic Inference / Bayesian Methods / Graphical Models / Causality',
              'Machine Learning (Supervised / Semi-Supervised / Online / Active / Low-shot Learning)',
              'Natural Language Processing / Natural Language Understanding',
              'Explainable AI / Fairness / Accountability / Privacy / Transparency / Ethics',
              'Representation Learning / Unsupervised Feature Learning',
              'Computer Vision Detection / Localization / Recognition',
              'Multi-Modal Learning (Vision + Language + Other Modalities)',
              'Optimization Methods',
              'Generative Models'
            ]}
            required={true}
          />
        </Stack>
      )}
    </>
  )
}

export default ConditionalQuestionsMentor

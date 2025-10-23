// React and hooks
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'

// Material-UI components
import { Stack, Typography, Button } from '@mui/material'

// Component imports
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import CheckboxQuestion from '../components/questions/CheckboxQuestion'
import DropdownQuestion from '../components/questions/DropdownQuestion'
import FormCard from '../components/FormCard'

// Services and API
import { Form, Formik } from 'formik'
import { getSurveyById, submitSurveyResponse } from '../api/surveys'
import { useSnackbar } from 'notistack'
import { useUser } from '../hooks/useUser'

const Survey = () => {
  const { id } = useParams()
  const { user } = useUser()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const topRef = useRef(null)
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true)
        const surveyData = await getSurveyById(id)
        setSurvey(surveyData)
      } finally {
        setLoading(false)
      }
    }
    fetchSurvey()
  }, [id])

  // Build initial form values based on questions
  const initialValues = useMemo(() => {
    const init = {}
    const qs = survey?.questions || []
    qs.forEach((q, idx) => {
      const name = q.id || `q_${idx}`
      if (q.type === 'checklist') init[name] = []
      else init[name] = ''
    })
    return init
  }, [survey])

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true)
    try {
      console.log('Form submitted with values:', values)
      const res = await submitSurveyResponse(id, values, user.uid)

      if (res.ok) {
        enqueueSnackbar('Survey submitted successfully!', {
          variant: 'success'
        })
      } else {
        enqueueSnackbar('Error submitting survey: ' + res.error, {
          variant: 'error'
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <FormCard
      props={{ height: '100vh' }}
      enableInfo={false}
      title={survey?.title || 'Survey'}
      description={survey?.description || ''}
      topRef={topRef}
      loading={loading}
    >
      {survey && (
        <Formik initialValues={initialValues} onSubmit={onSubmit}>
          {({ isSubmitting }) => (
            <Form>
              <Stack spacing={3}>
                {(survey.questions || []).length === 0 && (
                  <Typography color="text.secondary">
                    No questions in this survey.
                  </Typography>
                )}
                {(survey.questions || []).map((q) => {
                  const name = q.id
                  if (q.type === 'text') {
                    return (
                      <TextfieldQuestion
                        key={name}
                        name={name}
                        question={q.title}
                        description={q.description}
                        required={q.isRequired}
                      />
                    )
                  }
                  if (q.type === 'radio') {
                    return (
                      <RadioQuestion
                        key={name}
                        name={name}
                        question={q.title}
                        description={q.description}
                        options={q.options || []}
                        required={q.isRequired}
                      />
                    )
                  }
                  if (q.type === 'checklist') {
                    return (
                      <CheckboxQuestion
                        key={name}
                        name={name}
                        question={q.title}
                        description={q.description}
                        options={q.options || []}
                        required={q.isRequired}
                      />
                    )
                  }
                  if (q.type === 'dropdown') {
                    return (
                      <DropdownQuestion
                        key={name}
                        name={name}
                        question={q.title}
                        description={q.description}
                        options={q.options || []}
                        required={q.isRequired}
                      />
                    )
                  }
                  return null
                })}
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ width: '130px', alignSelf: 'flex-end' }}
                  loading={isSubmitting}
                >
                  Submit
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      )}
    </FormCard>
  )
}

export default Survey

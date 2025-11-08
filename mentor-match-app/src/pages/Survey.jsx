// React and hooks
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'

// Material-UI components
import { Stack, Typography, Button, Box } from '@mui/material'
import { LoadingButton } from '@mui/lab'

// Component imports
import TextfieldQuestion from '../components/questions/TextfieldQuestion'
import RadioQuestion from '../components/questions/RadioQuestion'
import CheckboxQuestion from '../components/questions/CheckboxQuestion'
import DropdownQuestion from '../components/questions/DropdownQuestion'
import FormCard from '../components/FormCard'
import MainCard from '../components/MainCard'

// Services and API
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import {
  getSurveyById,
  submitSurveyResponse,
  updateSurveyMeta
} from '../api/surveys'
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
  const [showSubmittedMessage, setShowSubmittedMessage] = useState(false)

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

  // Dynamic validation schema based on required flag and type
  const validationSchema = useMemo(() => {
    const shape = {}
    const qs = survey?.questions || []
    qs.forEach((q, idx) => {
      const name = q.id || `q_${idx}`
      if (q.isRequired) {
        if (q.type === 'checklist') {
          shape[name] = Yup.array().min(1, 'Required')
        } else {
          shape[name] = Yup.string().trim().required('Required')
        }
      } else {
        if (q.type === 'checklist') {
          shape[name] = Yup.array()
        } else {
          shape[name] = Yup.string().trim()
        }
      }
    })
    return Yup.object().shape(shape)
  }, [survey])

  const onSubmit = async (values, { setSubmitting }) => {
    setSubmitting(true)
    try {
      //console.log('Form submitted with values:', values)
      const res = await submitSurveyResponse(id, values, user.uid)
      await updateSurveyMeta(id, {
        responses: survey.responses + 1
      })

      if (res.ok) {
        enqueueSnackbar('Survey submitted successfully!', {
          variant: 'success'
        })
        setShowSubmittedMessage(true)
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

  // Map question types to components to eliminate duplicated conditional blocks
  const COMPONENTS = {
    text: TextfieldQuestion,
    radio: RadioQuestion,
    checklist: CheckboxQuestion,
    dropdown: DropdownQuestion
  }

  return (
    <>
      {showSubmittedMessage ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <Stack
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}
            mt={{ lg: 2 }}
            spacing={3}
          >
            <MainCard
              title={'Thank you for your submission!'}
              fontWeight={'light'}
              titleSize={'h5'}
            >
              <Stack spacing={3}>
                <Typography
                  color="text.secondary"
                  textAlign={'center'}
                  sx={{ mb: 2 }}
                >
                  Your response has been recorded
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  sx={{ alignSelf: 'end' }}
                >
                  Go to Dashboard
                </Button>
              </Stack>
            </MainCard>
          </Stack>
        </Box>
      ) : (
        <FormCard
          props={{ height: '100vh' }}
          enableInfo={false}
          title={survey?.title || 'Survey'}
          description={survey?.description || ''}
          topRef={topRef}
          loading={loading}
        >
          {survey && (
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              validateOnMount
              onSubmit={onSubmit}
            >
              {({ isSubmitting, isValid }) => (
                <Form>
                  <Stack spacing={3}>
                    {(survey.questions || []).length === 0 && (
                      <Typography color="text.secondary">
                        No questions in this survey.
                      </Typography>
                    )}
                    {(survey.questions || []).map((q) => {
                      const Comp = COMPONENTS[q.type]
                      if (!Comp) return null
                      return (
                        <Comp
                          key={q.id}
                          name={q.id}
                          question={q.title}
                          description={q.description}
                          options={q.options || []}
                          required={q.isRequired}
                        />
                      )
                    })}
                    <LoadingButton
                      variant="contained"
                      type="submit"
                      sx={{ width: '130px', alignSelf: 'flex-end' }}
                      loading={isSubmitting}
                      disabled={!isValid || isSubmitting}
                    >
                      Submit
                    </LoadingButton>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </FormCard>
      )}
    </>
  )
}

export default Survey

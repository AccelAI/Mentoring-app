import { useParams, useNavigate } from 'react-router-dom'
import { useRef, useState, useEffect, useCallback } from 'react'
import {
  Drawer,
  Box,
  Stack,
  Typography,
  Fab,
  Toolbar,
  Card,
  MenuItem,
  Tab,
  Tooltip,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material'
import { TabList, TabPanel, TabContext } from '@mui/lab'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material'
import Header from '../components/Header'
import QuestionPreview from '../components/surveys/QuestionPreview'
import OptionsEditor from '../components/surveys/OptionsEditor'
import AnswersTable from '../components/surveys/AnswersTable'
import {
  subscribeToSurvey,
  subscribeToQuestions,
  updateSurveyMeta,
  upsertQuestion,
  addQuestionToSurvey,
  deleteQuestionFromSurvey,
  getSurveyResponses
} from '../api/surveys'

const drawerWidth = 350
const EditSurvey = () => {
  const { id: surveyId } = useParams()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState('0')
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(null)
  const [surveyMeta, setSurveyMeta] = useState({
    title: 'Untitled Survey',
    description: ''
  })
  const [metaLoaded, setMetaLoaded] = useState(false)
  const [questionsLoaded, setQuestionsLoaded] = useState(false)
  const pendingSelectIdRef = useRef(null)

  // Realtime subscriptions
  useEffect(() => {
    if (!surveyId) return

    const unsubSurvey = subscribeToSurvey(surveyId, (snap) => {
      const data = snap.data()
      if (data) {
        setSurveyMeta({
          title: data.title || 'Untitled Survey',
          description: data.description || ''
        })
      }
      // Mark meta as loaded on first callback
      setMetaLoaded(true)
    })
    const unsubQuestions = subscribeToQuestions(surveyId, (list) => {
      setQuestions(list)
      setCurrentQuestionIndex((prev) => {
        if (pendingSelectIdRef.current) {
          const idx = list.findIndex((q) => q.id === pendingSelectIdRef.current)
          if (idx !== -1) {
            pendingSelectIdRef.current = null
            return idx
          }
        }
        if (list.length > 0 && (prev === null || prev >= list.length)) {
          return 0
        }
        return prev
      })
      // Mark questions as loaded on first callback
      setQuestionsLoaded(true)
    })
    return () => {
      unsubSurvey && unsubSurvey()
      unsubQuestions && unsubQuestions()
    }
    // eslint-disable-next-line
  }, [surveyId])

  // Debounced save helpers
  const metaSaveTimer = useRef(null)
  const questionSaveTimers = useRef({})

  const scheduleMetaSave = useCallback(
    (patch) => {
      clearTimeout(metaSaveTimer.current)
      metaSaveTimer.current = setTimeout(() => {
        updateSurveyMeta(surveyId, patch)
      }, 500)
    },
    [surveyId]
  )

  const scheduleQuestionSave = useCallback(
    (question) => {
      if (!question?.id) return
      const key = question.id
      clearTimeout(questionSaveTimers.current[key])
      questionSaveTimers.current[key] = setTimeout(() => {
        const { id, ...rest } = question
        upsertQuestion(surveyId, id, rest)
      }, 500)
    },
    [surveyId]
  )

  const handleAddNewQuestion = useCallback(async () => {
    const base = {
      title: 'Untitled Question',
      type: 'text',
      isRequired: false,
      options: ['Option 1'],
      description: '',
      order: Date.now()
    }
    const newId = await addQuestionToSurvey(surveyId, base.type, base)
    pendingSelectIdRef.current = newId
    // rely on subscribeToQuestions to update list and selection
    // eslint-disable-next-line
  }, [surveyId])

  const handleSelectQuestion = (index) => setCurrentQuestionIndex(index)

  const updateCurrentQuestion = (patch) => {
    setQuestions((prev) => {
      if (currentQuestionIndex === null || currentQuestionIndex >= prev.length)
        return prev
      const next = [...prev]
      next[currentQuestionIndex] = { ...next[currentQuestionIndex], ...patch }
      // schedule save
      scheduleQuestionSave(next[currentQuestionIndex])
      return next
    })
  }

  const handleDeleteCurrentQuestion = async () => {
    const current = questions[currentQuestionIndex]
    if (!current) return
    await deleteQuestionFromSurvey(surveyId, current.id)
    setQuestions((prev) => prev.filter((_, i) => i !== currentQuestionIndex))
    setCurrentQuestionIndex((prev) => {
      const remaining = questions.length - 1
      if (remaining <= 0) return null
      return Math.max(0, Math.min(prev, remaining - 1))
    })
  }

  const currentQuestion =
    currentQuestionIndex !== null ? questions[currentQuestionIndex] : null

  const isLoading = !metaLoaded || !questionsLoaded

  useEffect(() => {
    if (!surveyId) return
    let cancelled = false

    const fetchOnce = async () => {
      try {
        const res = await getSurveyResponses(surveyId)
        if (!cancelled && res?.ok) {
          //console.log('Fetched responses:', res)
          setResponses(res)
        }
      } catch (err) {
        console.error('Failed to fetch responses:', err)
      }
    }

    // Initial fetch on mount/id change
    fetchOnce()

    // Poll for updates to approximate real-time
    const intervalId = setInterval(fetchOnce, 120000)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [surveyId])

  return (
    <>
      <Header props={{ zIndex: (theme) => theme.zIndex.drawer + 1 }} />
      <Box display="flex" justifySelf="center">
        {/* EDIT QUESTION DRAWER */}
        <Drawer
          anchor="left"
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: drawerWidth,
              boxSizing: 'border-box'
            },
            elevation: 0
          }}
        >
          <Toolbar />
          <Box p={2} sx={{ flexGrow: 1 }}>
            <Stack spacing={2}>
              <Tooltip title="Back to Admin Dashboard">
                <IconButton
                  size="small"
                  sx={{ alignSelf: 'start' }}
                  onClick={() => navigate('/admin')}
                >
                  <BackIcon />
                </IconButton>
              </Tooltip>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" alignSelf={'flex-end'}>
                  Edit Question
                </Typography>
              </Stack>

              {currentQuestion ? (
                <>
                  <TextField
                    label="Question Title"
                    variant="standard"
                    multiline
                    minRows={1}
                    maxRows={4}
                    fullWidth
                    value={currentQuestion.title}
                    onChange={(e) =>
                      updateCurrentQuestion({ title: e.target.value })
                    }
                  />
                  <TextField
                    label="Question Description"
                    variant="standard"
                    multiline
                    minRows={1}
                    maxRows={4}
                    fullWidth
                    value={currentQuestion.description}
                    onChange={(e) =>
                      updateCurrentQuestion({ description: e.target.value })
                    }
                  />
                  <TextField
                    fullWidth
                    variant="standard"
                    label="Question Type"
                    select
                    value={currentQuestion.type}
                    onChange={(e) =>
                      updateCurrentQuestion({ type: e.target.value })
                    }
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="checklist">Checklist</MenuItem>
                    <MenuItem value="radio">Radio</MenuItem>
                    <MenuItem value="dropdown">Dropdown</MenuItem>
                  </TextField>

                  {(currentQuestion.type === 'checklist' ||
                    currentQuestion.type === 'radio' ||
                    currentQuestion.type === 'dropdown') && (
                    <OptionsEditor
                      questionType={currentQuestion.type}
                      currentOptions={currentQuestion.options}
                      updateOptions={(options) =>
                        updateCurrentQuestion({ options })
                      }
                    />
                  )}

                  <FormControlLabel
                    label="Is Required"
                    control={
                      <Checkbox
                        checked={!!currentQuestion.isRequired}
                        onChange={(e) =>
                          updateCurrentQuestion({
                            isRequired: e.target.checked
                          })
                        }
                      />
                    }
                    sx={{ ml: '-6px' }}
                  />
                  <Box flexGrow={1} />
                  <Button
                    size="small"
                    color="error"
                    sx={{ alignSelf: 'flex-end' }}
                    endIcon={<DeleteIcon />}
                    onClick={handleDeleteCurrentQuestion}
                  >
                    Delete question
                  </Button>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select a question to edit, or click “Add Question”.
                </Typography>
              )}
            </Stack>
          </Box>
        </Drawer>
        {/* END EDIT QUESTION DRAWER */}

        {/* MAIN CONTENT */}
        <Box
          p={{ md: 0, lg: 3 }}
          flexGrow={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
          maxWidth={{ lg: '70vw', md: '60vw' }}
        >
          {isLoading ? (
            <CircularProgress color="#fff" />
          ) : (
            <>
              <Stack
                sx={{
                  alignContent: 'center',
                  maxWidth: '-webkit-fill-available'
                }}
                spacing={2}
              >
                <Card sx={{ p: 3 }}>
                  <Stack spacing={1}>
                    <TextField
                      label="Survey Title"
                      fullWidth
                      value={surveyMeta.title}
                      onChange={(e) => {
                        const title = e.target.value
                        setSurveyMeta((s) => ({ ...s, title }))
                        scheduleMetaSave({ title })
                      }}
                      variant="standard"
                    />
                    <TextField
                      label="Survey Description"
                      fullWidth
                      value={surveyMeta.description}
                      onChange={(e) => {
                        const description = e.target.value
                        setSurveyMeta((s) => ({ ...s, description }))
                        scheduleMetaSave({ description })
                      }}
                      variant="standard"
                    />
                  </Stack>
                </Card>

                {/* QUESTIONS AND ANSWERS CARD */}
                <Card sx={{ p: 3 }}>
                  <TabContext value={tabValue}>
                    <TabList
                      value={tabValue}
                      onChange={(event, newValue) => setTabValue(newValue)}
                      variant="fullWidth"
                      sx={{
                        '& .MuiTabs-indicator': {
                          backgroundColor: 'accent.main'
                        }
                      }}
                    >
                      <Tab
                        label="Questions"
                        value="0"
                        sx={{ '&.Mui-selected': { color: 'accent.main' } }}
                      />
                      <Tab
                        label="Responses"
                        value="1"
                        sx={{ '&.Mui-selected': { color: 'accent.main' } }}
                      />
                    </TabList>

                    {/* QUESTIONS PREVIEW */}
                    <TabPanel value="0">
                      <Stack spacing={3}>
                        {questions.map((question, index) => (
                          <Box
                            key={question.id}
                            onClick={() => handleSelectQuestion(index)}
                          >
                            <QuestionPreview
                              questionData={question}
                              isCurrentQuestion={currentQuestionIndex === index}
                            />
                          </Box>
                        ))}
                        {questions.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No questions yet. Click “Add Question” to get
                            started.
                          </Typography>
                        )}
                      </Stack>
                    </TabPanel>

                    {/* RESPONSES PREVIEW */}
                    <TabPanel value="1">
                      <AnswersTable
                        data={responses}
                        questions={questions}
                        surveyName={surveyMeta.title}
                      />
                    </TabPanel>
                  </TabContext>
                </Card>
              </Stack>

              {/* ADD QUESTION BUTTON */}
              <Tooltip title="Add Question">
                <Fab
                  color="secondary"
                  aria-label="add"
                  sx={{
                    position: 'fixed',
                    right: { xs: 16, sm: 24, md: 32 },
                    bottom: {
                      xs: 'calc(env(safe-area-inset-bottom) + 16px)',
                      sm: 'calc(env(safe-area-inset-bottom) + 24px)',
                      md: 'calc(env(safe-area-inset-bottom) + 32px)'
                    },
                    zIndex: (theme) => theme.zIndex.appBar + 1
                  }}
                  onClick={handleAddNewQuestion}
                >
                  <AddIcon />
                </Fab>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </>
  )
}

export default EditSurvey

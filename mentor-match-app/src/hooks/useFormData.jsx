import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from 'notistack'
import { getFormAnswers } from '../api/forms'
import { useUser } from './useUser'

const useFormData = (defaultInitialValues, mergeFormAnswers, userId = null) => {
  const { id: urlId } = useParams()
  const id = userId || urlId // Use provided userId or fall back to URL param
  const { user, isAdmin } = useUser()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState(defaultInitialValues)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const formAnswers = await getFormAnswers(id)
        if (formAnswers.mentorData && formAnswers.menteeData) {
          setInitialValues(
            mergeFormAnswers(formAnswers.mentorData, formAnswers.menteeData)
          )
        } else if (formAnswers.mentorData) {
          setInitialValues(formAnswers.mentorData)
        } else if (formAnswers.menteeData) {
          setInitialValues(formAnswers.menteeData)
        }
      } catch (err) {
        enqueueSnackbar('Error fetching form data', { variant: 'error' })
      } finally {
        setLoading(false)
      }
    }

    if (id === user.uid || isAdmin) {
      fetchFormData()
    } else if (id && id !== user.uid && !isAdmin) {
      navigate('/form-not-found')
    } else {
      setLoading(false)
    }
  }, [id, user.uid, enqueueSnackbar, navigate, mergeFormAnswers, isAdmin])

  return { initialValues, loading }
}

export default useFormData

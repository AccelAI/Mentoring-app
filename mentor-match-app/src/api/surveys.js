import {
  doc,
  setDoc,
  collection,
  deleteDoc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  increment
} from 'firebase/firestore'
import { db } from './firebaseConfig'
import { getUserById } from './users'

export const createEmptySurvey = async (userId) => {
  try {
    const surveyRef = doc(collection(db, 'surveys'))
    const user = await getUserById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const author = { id: userId, name: user.displayName, email: user.email }
    await setDoc(surveyRef, {
      author,
      title: 'Untitled Survey',
      description: '',
      createdAt: serverTimestamp(),
      responses: 0,
      questionsCount: 0,
    })

    return surveyRef.id
  } catch (error) {
    console.error('Error creating survey:', error)
    throw error
  } 
}

export const deleteSurvey = async (surveyId) => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId)
    await deleteDoc(surveyRef)
    return { ok: true }
  } catch (error) {
    console.error('Error deleting survey:', error)
    return { ok: false, error: error.message }
  }
}

export const getSurveyById = async (surveyId) => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId)
    const surveySnapshot = await getDoc(surveyRef)
    if (!surveySnapshot.exists()) {
      throw new Error('Survey not found')
    }

    // Fetch questions ordered by "order"
    const questionsRef = collection(db, 'surveys', surveyId, 'questions')
    const questionsSnap = await getDocs(query(questionsRef, orderBy('order', 'asc')))
    const questions = questionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    return { id: surveySnapshot.id, ...surveySnapshot.data(), questions }
  } catch (error) {
    console.error('Error fetching survey by ID:', error)
    throw error
  }
}

export const getAllSurveys = async () => {
  try {
    const surveysCol = collection(db, 'surveys')
    const surveySnapshot = await getDocs(surveysCol)
    const surveys = surveySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    console.log('Fetched surveys:', surveys)
    return surveys
  } catch (error) {
    console.error('Error fetching surveys:', error)
    throw error
  }
}

// Adds a new document in subcollection surveys/{surveyId}/questions
// questionData: { title, type, options?, required?, description?, order? }
export const addQuestionToSurvey = async (surveyId, questionType, questionData = {}) => {
  try {
    const surveyRef = doc(db, 'surveys', surveyId)
    const questionsCol = collection(surveyRef, 'questions')

    const emptyDefault = {
      title: 'New Question',
      type: questionType,
      isRequired: false,
      options: [],
      description: '',
      order: Date.now()
    }

    const newQuestion = {
      ...emptyDefault,
      ...(questionData || {})
    }

    const qRef = await addDoc(questionsCol, newQuestion)
    // increment questionsCount
    await updateDoc(surveyRef, {
      questionsCount: increment(1),
      updatedAt: serverTimestamp()
    })

    return qRef.id
  } catch (error) {
    console.error('Error adding question to survey:', error)
    throw error
  }
}

// Subscribe to survey meta changes
export const subscribeToSurvey = (surveyId, callback) => {
  const surveyRef = doc(db, 'surveys', surveyId)
  return onSnapshot(surveyRef, callback)
}

// Subscribe to questions (ordered)
export const subscribeToQuestions = (surveyId, callback) => {
  const qRef = collection(db, 'surveys', surveyId, 'questions')
  const q = query(qRef, orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(list)
  })
}

// Update survey metadata (debounced from UI)
export const updateSurveyMeta = async (surveyId, patch) => {
  const surveyRef = doc(db, 'surveys', surveyId)
  await updateDoc(surveyRef, { ...patch, updatedAt: serverTimestamp() })
}

// Upsert a question (debounced from UI)
export const upsertQuestion = async (surveyId, questionId, patch) => {
  const qRef = doc(db, 'surveys', surveyId, 'questions', questionId)
  await setDoc(qRef, { ...patch }, { merge: true })
}

// Delete a question and decrement count
export const deleteQuestionFromSurvey = async (surveyId, questionId) => {
  const surveyRef = doc(db, 'surveys', surveyId)
  const qRef = doc(db, 'surveys', surveyId, 'questions', questionId)
  await deleteDoc(qRef)
  await updateDoc(surveyRef, {
    questionsCount: increment(-1),
    updatedAt: serverTimestamp()
  })
}

export const submitSurveyResponse = async (surveyId, responses, userId) => {
  try {
    const responsesCol = collection(db, 'surveys', surveyId, 'responses')
    const docRef = await addDoc(responsesCol, { answers: responses, submittedAt: serverTimestamp(), userId })
    return { ok: true, id: docRef.id }
  } catch (error) {
    console.error('Error submitting survey response:', error)
    return { ok: false, error: error.message }
  }
}

export const getSurveyResponses = async (surveyId) => {
  try {
    const responsesCol = collection(db, 'surveys', surveyId, 'responses')
    const responsesSnap = await getDocs(responsesCol)
    const responses = responsesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    return { ok: true, responses }
  } catch (error) {
    console.error('Error fetching survey responses:', error)
    return { ok: false, error: error.message }
  }
}

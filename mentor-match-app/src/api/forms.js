import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'

export const setMentorForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  try {
    const mentorDoc = doc(db, 'mentors', user.uid)
    await setDoc(mentorDoc, formData, { merge: true })
    const profileDoc = doc(db, 'users', user.uid)

    // Check if mentee document exists
    const menteeDocRef = doc(db, 'mentees', user.uid)
    const menteeDocSnap = await getDoc(menteeDocRef)

    if (menteeDocSnap.exists()) {
      await updateDoc(profileDoc, { role: 'Mentor/Mentee' })
    } else {
      await updateDoc(profileDoc, { role: 'Mentor' })
    }
    return { ok: true }
  } catch (err) {
    console.error('Error updating mentor form:', err)
    return { ok: false, error: err.message }
  }
}

export const setMenteeForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  try {
    const menteeDoc = doc(db, 'mentees', user.uid)
    await setDoc(menteeDoc, formData, { merge: true })
    const profileDoc = doc(db, 'users', user.uid)

    // Check if mentor document exists
    const mentorDocRef = doc(db, 'mentors', user.uid)
    const mentorDocSnap = await getDoc(mentorDocRef)

    if (mentorDocSnap.exists()) {
      await updateDoc(profileDoc, { role: 'Mentor/Mentee' })
    } else {
      await updateDoc(profileDoc, { role: 'Mentee' })
    }
    return { ok: true }
  } catch (err) {
    console.error('Error updating mentee form:', err)
    return { ok: false, error: err.message }
  }
}

export const setCombinedForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  const commonData = {
    // Common fields
    currentInstitution: formData.currentInstitution,
    currentPosition: formData.currentPosition,
    linkToResearch: formData.linkToResearch,
    preferredTimezone: formData.preferredTimezone,
    languages: formData.languages,
    preferredConnections: formData.preferredConnections,
    academicPapers: formData.academicPapers,
    openToDiscussImpacts: formData.openToDiscussImpacts
  }

  // Mentor-specific fields
  const mentorData = {
    ...commonData,
    seniority: formData.seniority,
    offeredSupport: formData.offeredSupport,
    mentoringTime: formData.mentoringTime,
    reviewerInAiConferences: formData.reviewerInAiConferences,
    reviewedConferences: formData.reviewedConferences,
    menteeCharacteristics: formData.menteeCharacteristics,
    menteePreferences: formData.menteePreferences,
    mentorSkills: formData.mentorSkills,
    areasConsideringMentoring: formData.areasConsideringMentoring,
    mentorFields: formData.mentorFields,
    contributeAsMentor: formData.contributeAsMentor,
    shareExperience: formData.shareExperience
  }

  // Mentee-specific fields
  const menteeData = {
    ...commonData,
    mentorshipAspirations: formData.mentorshipAspirations,
    commitmentStatement: formData.commitmentStatement,
    menteeProfile: formData.menteeProfile,
    submittedInAiConferences: formData.submittedInAiConferences,
    submittedPapers: formData.submittedPapers,
    planningToSubmit: formData.planningToSubmit,
    careerGoals: formData.careerGoals,
    mentoredSkills: formData.mentoredSkills,
    researchAreas: formData.researchAreas,
    menteeFields: formData.menteeFields,
    shareExperience: formData.shareExperience
  }

  try {
    await setMentorForm(user, mentorData)
    await setMenteeForm(user, menteeData)
    const profileDoc = doc(db, 'users', user.uid)
    await updateDoc(profileDoc, { role: 'Mentor/Mentee' })
    return { ok: true }
  } catch (err) {
    console.error('Error updating mentor and mentee form:', err)
    return { ok: false, error: err.message }
  }
}

export const getFormAnswers = async (userId) => {
  try {
    const mentorDoc = doc(db, 'mentors', userId)
    const menteeDoc = doc(db, 'mentees', userId)
    const mentorDocSnap = await getDoc(mentorDoc)
    const menteeDocSnap = await getDoc(menteeDoc)

    const mentorData = mentorDocSnap.exists() ? mentorDocSnap.data() : null
    const menteeData = menteeDocSnap.exists() ? menteeDocSnap.data() : null

    if (!mentorData && !menteeData) {
      return null
    }
    console.log('getFormData', { mentorData, menteeData })
    return { mentorData, menteeData }
  } catch (err) {
    console.error('Error fetching form answers:', err)
    return { ok: false, error: err.message }
  }
}

export const deleteFormAnswers = async (userId, formType) => {
  try {
    const deleteDocByType = {
      Mentor: async () => {
        const mentorDoc = doc(db, 'mentors', userId)
        await deleteDoc(mentorDoc)
      },
      Mentee: async () => {
        const menteeDoc = doc(db, 'mentees', userId)
        await deleteDoc(menteeDoc)
      },
      Combined: async () => {
        const mentorDoc = doc(db, 'mentors', userId)
        const menteeDoc = doc(db, 'mentees', userId)
        await Promise.all([deleteDoc(mentorDoc), deleteDoc(menteeDoc)])
      }
    }

    if (deleteDocByType[formType]) {
      await deleteDocByType[formType]()
      const profileDoc = doc(db, 'users', userId)
      await updateDoc(profileDoc, { role: '' })
    } else {
      throw new Error('Invalid form type')
    }

    return { ok: true }
  } catch (err) {
    console.error('Error deleting form answers:', err)
    return { ok: false, error: err.message }
  }
}

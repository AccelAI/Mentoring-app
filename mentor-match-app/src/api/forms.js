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
    if (doc(db, 'mentees', user.uid)) {
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
    if (doc(db, 'mentors', user.uid)) {
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

export const setMentorMenteeForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  // Separated the form data into mentee-specific and mentor-specific fields
  const commonData = {
    currentInstitution: formData.currentInstitution,
    currentPosition: formData.currentPosition,
    linkToResearch: formData.linkToResearch,
    preferredTimezone: formData.preferredTimezone,
    languages: formData.languages,
    conferences: formData.conferences,
    otherConferences: formData.otherConferences,
    openToDiscussImpacts: formData.openToDiscussImpacts,
    reviewerInWorkshop: formData.reviewerInWorkshop,
    publicationsInWorkshop: formData.publicationsInWorkshop,
    reviewerInAiConferences: formData.reviewerInAiConferences,
    publicationsInAiConferences: formData.publicationsInAiConferences,
    reviewerInAiJournals: formData.reviewerInAiJournals,
    publicationsInAiJournals: formData.publicationsInAiJournals
  }

  const menteeData = {
    ...commonData,
    preferredExpectations: formData.preferredExpectationsMentee,
    careerGoals: formData.careerGoals,
    menteeMotivation: formData.menteeMotivation,
    commitmentStatement: formData.commitmentStatement,
    topResearchAreas: formData.topResearchAreas,
    mentoredSkills: formData.mentoredSkills
  }

  const mentorData = {
    ...commonData,
    preferredExpectations: formData.preferredExpectationsMentor,
    otherMenteePref: formData.otherMenteePref,
    otherExpectations: formData.otherExpectations,
    mentorMotivation: formData.mentorMotivation,
    mentorArea: formData.mentorArea,
    mentoringTime: formData.mentoringTime,
    menteePreferences: formData.menteePreferences,
    mentorSkills: formData.mentorSkills,
    areasConsideringMentoring: formData.areasConsideringMentoring
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
    const mentorData = mentorDocSnap.data()
    const menteeData = menteeDocSnap.data()
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

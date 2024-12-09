import { doc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'

export const setMentorForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  try {
    const mentorDoc = doc(db, 'mentors', user.uid)
    await setDoc(mentorDoc, formData, { merge: true })
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

  // Separate the form data into mentee-specific and mentor-specific fields
  const menteeData = {
    currentInstitution: formData.currentInstitution,
    currentPosition: formData.currentPosition,
    linkToResearch: formData.linkToResearch,
    preferredTimezone: formData.preferredTimezone,
    languages: formData.languages,
    conferences: formData.conferences,
    otherConferences: formData.otherConferences,
    openToDiscussImpacts: formData.openToDiscussImpacts,
    preferredExpectations: formData.preferredExpectationsMentee,
    careerGoals: formData.careerGoals,
    menteeMotivation: formData.menteeMotivation,
    commitmentStatement: formData.commitmentStatement,
    topResearchAreas: formData.topResearchAreas,
    mentoredSkills: formData.mentoredSkills,
    reviewerInWorkshop: formData.reviewerInWorkshop,
    publicationsInWorkshop: formData.publicationsInWorkshop,
    reviewerInAiConferences: formData.reviewerInAiConferences,
    publicationsInAiConferences: formData.publicationsInAiConferences,
    reviewerInAiJournals: formData.reviewerInAiJournals,
    publicationsInAiJournals: formData.publicationsInAiJournals
  }

  const mentorData = {
    currentInstitution: formData.currentInstitution,
    currentPosition: formData.currentPosition,
    linkToResearch: formData.linkToResearch,
    preferredTimezone: formData.preferredTimezone,
    languages: formData.languages,
    conferences: formData.conferences,
    otherConferences: formData.otherConferences,
    openToDiscussImpacts: formData.openToDiscussImpacts,
    preferredExpectations: formData.preferredExpectationsMentor,
    otherMenteePref: formData.otherMenteePref,
    otherExpectations: formData.otherExpectations,
    mentorMotivation: formData.mentorMotivation,
    mentorArea: formData.mentorArea,
    mentoringTime: formData.mentoringTime,
    menteePreferences: formData.menteePreferences,
    mentorSkills: formData.mentorSkills,
    areasConsideringMentoring: formData.areasConsideringMentoring,
    reviewerInWorkshop: formData.reviewerInWorkshop,
    publicationsInWorkshop: formData.publicationsInWorkshop,
    reviewerInAiConferences: formData.reviewerInAiConferences,
    publicationsInAiConferences: formData.publicationsInAiConferences,
    reviewerInAiJournals: formData.reviewerInAiJournals,
    publicationsInAiJournals: formData.publicationsInAiJournals
  }

  try {
    await setMentorForm(user, mentorData)
    await setMenteeForm(user, menteeData)
    return { ok: true }
  } catch (err) {
    console.error('Error updating mentor and mentee form:', err)
    return { ok: false, error: err.message }
  }
}

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore'
import { db } from './firebaseConfig'

export const setMentorForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  try {
    const mentorDoc = doc(db, 'mentors', user.uid)
    const formDataWithStatus = {
      ...formData,
      status: 'pending', // Default status for new applications
      submittedAt: new Date(),
      lastUpdated: new Date()
    }
    await setDoc(mentorDoc, formDataWithStatus, { merge: true })
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
    const formDataWithStatus = {
      ...formData,
      status: 'pending', // Default status for new applications
      submittedAt: new Date(),
      lastUpdated: new Date()
    }
    await setDoc(menteeDoc, formDataWithStatus, { merge: true })
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
    publicationsInAiJournals: formData.publicationsInAiJournals,
    status: 'pending', // Default status for new applications
    submittedAt: new Date(),
    lastUpdated: new Date()
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
    // Directly set the documents without calling setMentorForm/setMenteeForm to avoid double status setting
    const mentorDoc = doc(db, 'mentors', user.uid)
    const menteeDoc = doc(db, 'mentees', user.uid)

    await Promise.all([
      setDoc(mentorDoc, mentorData, { merge: true }),
      setDoc(menteeDoc, menteeData, { merge: true })
    ])

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

export const updateApplicationStatus = async (
  userId,
  formType,
  status,
  adminNotes = ''
) => {
  try {
    const validStatuses = ['pending', 'approved', 'denied']
    if (!validStatuses.includes(status)) {
      throw new Error(
        'Invalid status. Must be one of: pending, approved, denied'
      )
    }

    const updateData = {
      status,
      lastUpdated: new Date(),
      reviewedAt: new Date(),
      adminNotes
    }

    const updateDocByType = {
      Mentor: async () => {
        const mentorDoc = doc(db, 'mentors', userId)
        await updateDoc(mentorDoc, updateData)
      },
      Mentee: async () => {
        const menteeDoc = doc(db, 'mentees', userId)
        await updateDoc(menteeDoc, updateData)
      },
      Combined: async () => {
        const mentorDoc = doc(db, 'mentors', userId)
        const menteeDoc = doc(db, 'mentees', userId)
        await Promise.all([
          updateDoc(mentorDoc, updateData),
          updateDoc(menteeDoc, updateData)
        ])
      }
    }

    if (updateDocByType[formType]) {
      await updateDocByType[formType]()
    } else {
      throw new Error('Invalid form type')
    }

    return { ok: true }
  } catch (err) {
    console.error('Error updating application status:', err)
    return { ok: false, error: err.message }
  }
}

export const getFormAnswersByStatus = async (status) => {
  try {
    const mentorDoc = query(
      collection(db, 'mentors'),
      where('status', '==', status)
    )
    const menteeDoc = query(
      collection(db, 'mentees'),
      where('status', '==', status)
    )
    const mentorDocSnap = await getDocs(mentorDoc)
    const menteeDocSnap = await getDocs(menteeDoc)

    const mentorData = mentorDocSnap.docs.map((doc) => doc.data())
    const menteeData = menteeDocSnap.docs.map((doc) => doc.data())

    if (!mentorData && !menteeData) {
      return null
    }
    return { mentorData, menteeData }
  } catch (err) {
    console.error('Error fetching form answers by status:', err)
    return { ok: false, error: err.message }
  }
}

export const getPendingApplications = async () => {
  try {
    // Get pending mentor applications
    const mentorQuery = query(
      collection(db, 'mentors'),
      where('status', '==', 'pending')
    )
    const menteeQuery = query(
      collection(db, 'mentees'),
      where('status', '==', 'pending')
    )

    const [mentorDocs, menteeDocs] = await Promise.all([
      getDocs(mentorQuery),
      getDocs(menteeQuery)
    ])

    const applications = []

    // Process mentor applications
    for (const mentorDoc of mentorDocs.docs) {
      const mentorData = mentorDoc.data()
      const userDoc = await getDoc(doc(db, 'users', mentorDoc.id))
      const userData = userDoc.exists() ? userDoc.data() : {}

      applications.push({
        id: mentorDoc.id,
        type: 'Mentor',
        user: { uid: mentorDoc.id, ...userData },
        formData: mentorData,
        submittedAt: mentorData.submittedAt
      })
    }

    // Process mentee applications
    for (const menteeDoc of menteeDocs.docs) {
      const menteeData = menteeDoc.data()
      const userDoc = await getDoc(doc(db, 'users', menteeDoc.id))
      const userData = userDoc.exists() ? userDoc.data() : {}

      applications.push({
        id: menteeDoc.id,
        type: 'Mentee',
        user: { uid: menteeDoc.id, ...userData },
        formData: menteeData,
        submittedAt: menteeData.submittedAt
      })
    }

    // Check for combined applications (users who have both mentor and mentee forms)
    const combinedUsers = new Set()
    applications.forEach((app) => {
      if (
        applications.some(
          (other) => other.id === app.id && other.type !== app.type
        )
      ) {
        combinedUsers.add(app.id)
      }
    })

    // Filter out individual mentor/mentee apps for users who have both
    const filteredApplications = applications.filter((app) => {
      if (combinedUsers.has(app.id)) {
        // Only keep one entry per combined user (prefer mentor type)
        return app.type === 'Mentor'
      }
      return true
    })

    // Update type to 'Combined' and merge data for users with both forms
    filteredApplications.forEach((app) => {
      if (combinedUsers.has(app.id)) {
        app.type = 'Combined'

        // Find the corresponding mentee data for this user
        const menteeApp = applications.find(
          (other) => other.id === app.id && other.type === 'Mentee'
        )

        if (menteeApp) {
          // Merge mentor and mentee data, with mentor data taking precedence for common fields
          const mergedData = {
            ...menteeApp.formData, // Start with mentee data
            ...app.formData, // Override with mentor data for common fields
            // Ensure mentee-specific fields are preserved
            menteeMotivation: menteeApp.formData.menteeMotivation,
            commitmentStatement: menteeApp.formData.commitmentStatement,
            careerGoals: menteeApp.formData.careerGoals,
            preferredExpectationsMentee:
              menteeApp.formData.preferredExpectations,
            // Ensure mentor-specific fields are preserved
            mentorMotivation: app.formData.mentorMotivation,
            mentorArea: app.formData.mentorArea,
            mentoringTime: app.formData.mentoringTime,
            menteePreferences: app.formData.menteePreferences,
            preferredExpectationsMentor: app.formData.preferredExpectations,
            otherMenteePref: app.formData.otherMenteePref,
            otherExpectations: app.formData.otherExpectations,
            mentorSkills: app.formData.mentorSkills,
            areasConsideringMentoring: app.formData.areasConsideringMentoring
          }

          app.formData = mergedData
        }
      }
    })

    // Sort by submission date (newest first)
    filteredApplications.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    )

    return filteredApplications
  } catch (err) {
    console.error('Error fetching pending applications:', err)
    return []
  }
}

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  collection,
  getDocs,
  collectionGroup
} from 'firebase/firestore'
import { db } from './firebaseConfig'

export const setMentorForm = async (user, formData) => {
  if (!user || !user.uid) {
    return { ok: false, error: 'Invalid user object' }
  }

  try {
    const mentorDoc = doc(db, 'mentors', user.uid)
    const mentorSnap = await getDoc(mentorDoc)
    const isNew = !mentorSnap.exists()

    // Save only form data to the mentor document (no status fields)
    await setDoc(mentorDoc, { ...formData }, { merge: true })

    // Save status fields in subcollection: mentors/{uid}/applicationStatus/current
    const statusRef = doc(
      db,
      'mentors',
      user.uid,
      'applicationStatus',
      'current'
    )
    if (isNew) {
      await setDoc(
        statusRef,
        { status: 'pending', submittedAt: new Date(), lastUpdated: new Date() },
        { merge: true }
      )
    } else {
      await setDoc(
        statusRef,
        { status: 'pending', lastUpdated: new Date() },
        { merge: true }
      )
    }

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
    const menteeSnap = await getDoc(menteeDoc)
    const isNew = !menteeSnap.exists()

    // Save only form data to the mentee document (no status fields)
    await setDoc(menteeDoc, { ...formData }, { merge: true })

    // Save status fields in subcollection: mentees/{uid}/applicationStatus/current
    const statusRef = doc(
      db,
      'mentees',
      user.uid,
      'applicationStatus',
      'current'
    )
    if (isNew) {
      await setDoc(
        statusRef,
        { status: 'pending', submittedAt: new Date(), lastUpdated: new Date() },
        { merge: true }
      )
    } else {
      await setDoc(
        statusRef,
        { status: 'pending', lastUpdated: new Date() },
        { merge: true }
      )
    }

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

  // Common fields (no status/timestamps here)
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
    contributeAsMentor: formData.contributeAsMentor
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
    const mentorDocRef = doc(db, 'mentors', user.uid)
    const menteeDocRef = doc(db, 'mentees', user.uid)
    const [mentorSnap, menteeSnap] = await Promise.all([
      getDoc(mentorDocRef),
      getDoc(menteeDocRef)
    ])
    const isNewMentor = !mentorSnap.exists()
    const isNewMentee = !menteeSnap.exists()

    // Save form data to both docs
    await Promise.all([
      setDoc(mentorDocRef, mentorData, { merge: true }),
      setDoc(menteeDocRef, menteeData, { merge: true })
    ])

    // Save status fields to subcollections for both
    const mentorStatusRef = doc(
      db,
      'mentors',
      user.uid,
      'applicationStatus',
      'current'
    )
    const menteeStatusRef = doc(
      db,
      'mentees',
      user.uid,
      'applicationStatus',
      'current'
    )

    await Promise.all([
      setDoc(
        mentorStatusRef,
        isNewMentor
          ? {
              status: 'pending',
              submittedAt: new Date(),
              lastUpdated: new Date()
            }
          : { status: 'pending', lastUpdated: new Date() },
        { merge: true }
      ),
      setDoc(
        menteeStatusRef,
        isNewMentee
          ? {
              status: 'pending',
              submittedAt: new Date(),
              lastUpdated: new Date()
            }
          : { status: 'pending', lastUpdated: new Date() },
        { merge: true }
      )
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
    const validStatuses = ['pending', 'approved', 'rejected']
    if (!validStatuses.includes(status)) {
      throw new Error(
        'Invalid status. Must be one of: pending, approved, rejected'
      )
    }

    const updateData = {
      status,
      lastUpdated: new Date(),
      reviewedAt: new Date(),
      adminNotes
    }

    const updateByType = {
      Mentor: async () => {
        const statusRef = doc(
          db,
          'mentors',
          userId,
          'applicationStatus',
          'current'
        )
        await setDoc(statusRef, updateData, { merge: true })
      },
      Mentee: async () => {
        const statusRef = doc(
          db,
          'mentees',
          userId,
          'applicationStatus',
          'current'
        )
        await setDoc(statusRef, updateData, { merge: true })
      },
      Combined: async () => {
        const mentorStatusRef = doc(
          db,
          'mentors',
          userId,
          'applicationStatus',
          'current'
        )
        const menteeStatusRef = doc(
          db,
          'mentees',
          userId,
          'applicationStatus',
          'current'
        )
        await Promise.all([
          setDoc(mentorStatusRef, updateData, { merge: true }),
          setDoc(menteeStatusRef, updateData, { merge: true })
        ])
      }
    }

    if (updateByType[formType]) {
      await updateByType[formType]()
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
    // Query status docs across both mentors and mentees
    const statusQ = query(
      collectionGroup(db, 'applicationStatus'),
      where('status', '==', status)
    )
    const statusSnap = await getDocs(statusQ)

    const mentorData = []
    const menteeData = []

    for (const s of statusSnap.docs) {
      const parentDocRef = s.ref.parent.parent // mentors/{uid} or mentees/{uid}
      if (!parentDocRef) continue
      const parentSnap = await getDoc(parentDocRef)
      if (!parentSnap.exists()) continue

      // Merge form data with status fields to preserve original consumer shape
      const merged = { ...parentSnap.data(), ...s.data() }
      const parentCollection = parentDocRef.parent.id
      if (parentCollection === 'mentors') {
        mentorData.push(merged)
      } else if (parentCollection === 'mentees') {
        menteeData.push(merged)
      }
    }

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
    // Query pending status docs across both mentors and mentees
    const statusQ = query(
      collectionGroup(db, 'applicationStatus'),
      where('status', '==', 'pending')
    )
    const statusSnap = await getDocs(statusQ)

    const applications = []

    for (const s of statusSnap.docs) {
      const statusData = s.data()
      const parentDocRef = s.ref.parent.parent // mentors/{uid} or mentees/{uid}
      if (!parentDocRef) continue

      const parentSnap = await getDoc(parentDocRef)
      if (!parentSnap.exists()) continue
      const formData = parentSnap.data()

      const userId = parentDocRef.id
      const parentCollection = parentDocRef.parent.id
      const type = parentCollection === 'mentors' ? 'Mentor' : 'Mentee'

      const userDoc = await getDoc(doc(db, 'users', userId))
      const userData = userDoc.exists() ? userDoc.data() : {}

      applications.push({
        id: userId,
        type,
        user: { uid: userId, ...userData },
        formData,
        submittedAt: statusData.submittedAt
      })
    }

    // Identify combined (both mentor and mentee) users
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

    const filteredApplications = applications.filter((app) => {
      if (combinedUsers.has(app.id)) {
        return app.type === 'Mentor'
      }
      return true
    })

    // Merge mentor + mentee data for combined users
    filteredApplications.forEach((app) => {
      if (combinedUsers.has(app.id)) {
        app.type = 'Combined'
        const menteeApp = applications.find(
          (other) => other.id === app.id && other.type === 'Mentee'
        )
        if (menteeApp) {
          const mergedData = {
            ...menteeApp.formData,
            ...app.formData,
            menteeMotivation: menteeApp.formData.menteeMotivation,
            commitmentStatement: menteeApp.formData.commitmentStatement,
            careerGoals: menteeApp.formData.careerGoals,
            preferredExpectationsMentee:
              menteeApp.formData.preferredExpectations,
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

    // Helper to normalize dates for sorting
    const toMillis = (v) =>
      v && typeof v.toDate === 'function'
        ? v.toDate().getTime()
        : new Date(v).getTime()

    filteredApplications.sort(
      (a, b) => toMillis(b.submittedAt) - toMillis(a.submittedAt)
    )

    return filteredApplications
  } catch (err) {
    console.error('Error fetching pending applications:', err)
    return []
  }
}

export const getFormType = async (userId) => {
  const formAnswers = await getFormAnswers(userId)
  if (!formAnswers || formAnswers.ok === false) return null
  const { mentorData, menteeData } = formAnswers

  if (mentorData && menteeData) return 'Combined'
  if (mentorData) return 'Mentor'
  if (menteeData) return 'Mentee'

  return null
}

export const getCurrentApplicationStatus = async (userId, formType) => {
  try {
    const fetchStatus = async (collectionName) => {
      const statusRef = doc(
        db,
        collectionName,
        userId,
        'applicationStatus',
        'current'
      )
      const snap = await getDoc(statusRef)
      return snap.exists() ? snap.data() : null
    }

    switch (formType) {
      case 'Mentor':
        return await fetchStatus('mentors')
      case 'Mentee':
        return await fetchStatus('mentees')
      case 'Combined': {
        // Unified status: prefer mentor status, fallback to mentee
        return (await fetchStatus('mentors')) ?? (await fetchStatus('mentees'))
      }
      default:
        return null
    }
  } catch (err) {
    console.error('Error fetching current application status:', err)
    return null
  }
}

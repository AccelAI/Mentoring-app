import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  collectionGroup
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// Helper to set application status for mentor/mentee
const setApplicationStatus = async (collection, uid, isNew) => {
  const statusRef = doc(db, collection, uid, 'applicationStatus', 'current')
  const statusData = isNew
    ? { status: 'pending', submittedAt: new Date(), lastUpdated: new Date() }
    : { status: 'pending', lastUpdated: new Date() }
  await setDoc(statusRef, statusData, { merge: true })
}

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
    await setApplicationStatus('mentors', user.uid, isNew)

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
    await setApplicationStatus('mentees', user.uid, isNew)

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
    // Helper to fetch or set status if missing
    const fetchOrSetStatus = async (collectionName) => {
      const statusRef = doc(
        db,
        collectionName,
        userId,
        'applicationStatus',
        'current'
      )
      const snap = await getDoc(statusRef)
      if (!snap.exists()) {
        await setApplicationStatus(collectionName, userId, true)
        const newSnap = await getDoc(statusRef)
        return newSnap.exists() ? newSnap.data() : null
      }
      return snap.data()
    }

    if (formType === 'Mentor') return await fetchOrSetStatus('mentors')
    if (formType === 'Mentee') return await fetchOrSetStatus('mentees')
    if (formType === 'Combined') {
      // Prefer mentor status, fallback to mentee
      return (
        (await fetchOrSetStatus('mentors')) ??
        (await fetchOrSetStatus('mentees'))
      )
    }
    return null
  } catch (err) {
    console.error('Error fetching current application status:', err)
    return null
  }
}

export const getApplicationByUserId = async (userId) => {
  try {
    if (!userId) return null

    const collections = [
      { name: 'mentors', type: 'Mentor' },
      { name: 'mentees', type: 'Mentee' }
    ]

    const results = await Promise.all(
      collections.map(async ({ name, type }) => {
        const formRef = doc(db, name, userId)
        const statusRef = doc(db, name, userId, 'applicationStatus', 'current')
        const [formSnap, statusSnap] = await Promise.all([
          getDoc(formRef),
          getDoc(statusRef)
        ])
        if (!formSnap.exists() || !statusSnap.exists()) return null
        return {
          type,
          formData: formSnap.data(),
          statusData: statusSnap.data()
        }
      })
    )

    const mentorEntry = results.find((r) => r && r.type === 'Mentor')
    const menteeEntry = results.find((r) => r && r.type === 'Mentee')

    if (!mentorEntry && !menteeEntry) return null

    // Fetch user profile
    const userDocSnap = await getDoc(doc(db, 'users', userId))
    const userProfile = userDocSnap.exists() ? userDocSnap.data() : {}

    // If both exist -> Combined
    if (mentorEntry && menteeEntry) {
      const mergedData = {
        ...menteeEntry.formData,
        ...mentorEntry.formData,
        menteeMotivation: menteeEntry.formData.menteeMotivation,
        commitmentStatement: menteeEntry.formData.commitmentStatement,
        careerGoals: menteeEntry.formData.careerGoals,
        preferredExpectationsMentee: menteeEntry.formData.preferredExpectations,
        mentorMotivation: mentorEntry.formData.mentorMotivation,
        mentorArea: mentorEntry.formData.mentorArea,
        mentoringTime: mentorEntry.formData.mentoringTime,
        menteePreferences: mentorEntry.formData.menteePreferences,
        preferredExpectationsMentor: mentorEntry.formData.preferredExpectations,
        otherMenteePref: mentorEntry.formData.otherMenteePref,
        otherExpectations: mentorEntry.formData.otherExpectations,
        mentorSkills: mentorEntry.formData.mentorSkills,
        areasConsideringMentoring:
          mentorEntry.formData.areasConsideringMentoring
      }

      // Choose submittedAt (prefer earliest if both have it)
      const toMillis = (v) =>
        v && typeof v.toDate === 'function'
          ? v.toDate().getTime()
          : v
            ? new Date(v).getTime() // prettier-ignore
            : Infinity // prettier-ignore
      const submittedAt =
        toMillis(mentorEntry.statusData.submittedAt) <
        toMillis(menteeEntry.statusData.submittedAt)
          ? mentorEntry.statusData.submittedAt
          : menteeEntry.statusData.submittedAt

      return {
        id: userId,
        type: 'Combined',
        user: { uid: userId, ...userProfile },
        formData: mergedData,
        submittedAt
      }
    }

    // Single form (Mentor or Mentee)
    const single = mentorEntry || menteeEntry
    return {
      id: userId,
      type: single.type,
      user: { uid: userId, ...userProfile },
      formData: single.formData,
      submittedAt: single.statusData.submittedAt
    }
  } catch (err) {
    console.error('Error fetching application by user id:', err)
    return null
  }
}

export const getAllApplications = async () => {
  try {
    // Fetch all status docs across mentors and mentees
    const statusSnap = await getDocs(collectionGroup(db, 'applicationStatus'))

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
        submittedAt: statusData.submittedAt,
        status: statusData.status
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

    // Prefer the mentor entry when a user has both
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
          // Keep mentor’s status for the combined entry
          app.status = app.status || 'pending'
        }
      }
    })

    // Helper to normalize dates for sorting
    const toMillis = (v) =>
      v && typeof v.toDate === 'function'
        ? v.toDate().getTime()
        : v
          ? new Date(v).getTime() //prettier-ignore
          : 0 //prettier-ignore

    filteredApplications.sort(
      (a, b) => toMillis(b.submittedAt) - toMillis(a.submittedAt)
    )

    return filteredApplications
  } catch (err) {
    console.error('Error fetching all applications:', err)
    return []
  }
}

import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

export const asignMatch = async (menteeId, mentorId) => {
  try {
    // Assign mentorId to mentee
    const userDoc = doc(db, 'users', menteeId)
    await updateDoc(userDoc, { mentorId })

    // Add menteeId to mentor's list of mentees
    const mentorDoc = doc(db, 'users', mentorId)
    const mentorSnap = await getDoc(mentorDoc)
    const currentMentees =
      mentorSnap.exists() && Array.isArray(mentorSnap.data().menteesId)
        ? mentorSnap.data().menteesId
        : []

    // Limit to max 2 mentees
    if (currentMentees.length >= 2) {
      return {
        ok: false,
        error: 'Mentor already has maximum number of mentees.'
      }
    }

    if (currentMentees.includes(menteeId)) {
      return {
        ok: false,
        error: 'This mentee is already assigned to this mentor.'
      }
    }

    await updateDoc(mentorDoc, {
      menteesId: [...currentMentees, menteeId],
      newMenteeMatch: true
    })

    const mentorHistoryDoc = doc(
      db,
      'users',
      mentorId,
      'mentor-history',
      menteeId
    )
    await setDoc(mentorHistoryDoc, {
      menteeId,
      mentorshipStartDate: new Date(),
      mentorshipStatus: 'ongoing',
      additionalInfo: '',
      termniationReason: '',
      mentorshipEndDate: null
    })

    return { ok: true }
  } catch (err) {
    console.error('Error asigning match:', err)
    return { ok: false, error: err.message }
  }
}

export const updateNewMatchNotification = async (mentorId) => {
  try {
    const mentorDoc = doc(db, 'users', mentorId)
    await updateDoc(mentorDoc, {
      newMenteeMatch: false
    })
  } catch (err) {
    console.error('Error updating mentee match notification:', err)
    return { ok: false, error: err.message }
  }
}

export const endMentorship = async (
  menteeId,
  mentorId,
  termniationReason,
  additionalInfo
) => {
  try {
    console.log(
      `Ending mentorship between Mentee: ${menteeId} and Mentor: ${mentorId}`
    )
    const menteeDoc = doc(db, 'users', menteeId)
    await updateDoc(menteeDoc, { mentorId: null })

    const mentorDoc = doc(db, 'users', mentorId)
    const mentorSnap = await getDoc(mentorDoc)
    const mentees = Array.isArray(mentorSnap.data().menteesId)
      ? mentorSnap.data().menteesId
      : []
    const updatedMentees = mentees.filter((uid) => uid !== menteeId)
    console.log('Updated mentees:', updatedMentees)
    await updateDoc(mentorDoc, {
      menteesId: updatedMentees
    })

    const mentorHistoryDoc = doc(
      db,
      'users',
      mentorId,
      'mentor-history',
      menteeId
    )
    await updateDoc(mentorHistoryDoc, {
      mentorshipEndDate: new Date(),
      mentorshipStatus: 'ended',
      termniationReason,
      additionalInfo
    })

    console.log(
      `Mentorship ended between Mentee: ${menteeId} and Mentor: ${mentorId}`
    )
    return { ok: true }
  } catch (err) {
    console.error('Error ending mentorship:', err)
    return { ok: false, error: err.message }
  }
}

export const getMentorshipStartDate = async (menteeId, mentorId) => {
  try {
    const mentorHistoryDoc = doc(
      db,
      'users',
      mentorId,
      'mentor-history',
      menteeId
    )
    const mentorHistorySnap = await getDoc(mentorHistoryDoc)

    if (mentorHistorySnap.exists()) {
      const data = mentorHistorySnap.data()
      const date = new Date(data.mentorshipStartDate).toLocaleDateString(
        'en-US',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }
      )
      return date
    } else {
      console.error('Mentorship history not found')
      return null
    }
  } catch (err) {
    console.error('Error fetching mentorship start date:', err)
    return null
  }
}

export const getAllMentorshipPairs = async () => {
  try {
    const usersCol = collection(db, 'users')
    const snapshot = await getDocs(usersCol)
    const pairs = []
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      if (data.mentorId) {
        const mentorDocRef = doc(db, 'users', data.mentorId)
        const pair = await getDoc(mentorDocRef)
        if (
          pair.exists() &&
          Array.isArray(pair.data().menteesId) &&
          pair.data().menteesId.includes(docSnap.id)
        ) {
          pairs.push({ menteeId: docSnap.id, mentorId: data.mentorId })
        }
      }
    }
    return pairs
  } catch (err) {
    console.error('Error fetching mentorship pairs:', err)
    return []
  }
}

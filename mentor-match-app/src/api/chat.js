import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  where,
  or,
  getDocs,
  deleteDoc
} from 'firebase/firestore'
import { db } from './firebaseConfig'

// Create a chat room between two users
export const createChatRoom = async (user1Id, user2Id) => {
  try {
    const chatRoomRef = await addDoc(collection(db, 'chatRooms'), {
      participants: [user1Id, user2Id].sort(),
      createdAt: serverTimestamp(),
      lastMessage: null,
      lastMessageTime: null
    })
    return { ok: true, chatRoomId: chatRoomRef.id }
  } catch (error) {
    console.error('Error creating chat room:', error)
    return { ok: false, error: error.message }
  }
}

// Get or create a chat room between two users
export const getOrCreateChatRoom = async (user1Id, user2Id) => {
  try {
    // Check if chat room already exists
    const participants = [user1Id, user2Id].sort()
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', '==', participants)
    )

    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      return { ok: true, chatRoomId: querySnapshot.docs[0].id }
    }

    // Create new chat room if it doesn't exist
    return await createChatRoom(user1Id, user2Id)
  } catch (error) {
    console.error('Error getting or creating chat room:', error)
    return { ok: false, error: error.message }
  }
}

// Send a message
export const sendMessage = async (chatRoomId, senderId, messageText) => {
  try {
    const messageRef = await addDoc(
      collection(db, 'chatRooms', chatRoomId, 'messages'),
      {
        senderId,
        text: messageText,
        timestamp: serverTimestamp(),
        read: false
      }
    )

    // Update chat room with last message
    const chatRoomRef = doc(db, 'chatRooms', chatRoomId)
    await updateDoc(chatRoomRef, {
      lastMessage: messageText,
      lastMessageTime: serverTimestamp()
    })

    return { ok: true, messageId: messageRef.id }
  } catch (error) {
    console.error('Error sending message:', error)
    return { ok: false, error: error.message }
  }
}

// Get user's chat rooms
export const getUserChatRooms = (userId, callback) => {
  console.log('Getting chat rooms for user:', userId)

  try {
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userId)
    )

    return onSnapshot(
      q,
      (querySnapshot) => {
        const chatRooms = []
        querySnapshot.forEach((doc) => {
          chatRooms.push({
            id: doc.id,
            ...doc.data()
          })
        })

        // Sort by lastMessageTime, handling null values
        chatRooms.sort((a, b) => {
          const timeA = a.lastMessageTime?.toDate?.() || new Date(0)
          const timeB = b.lastMessageTime?.toDate?.() || new Date(0)
          return timeB - timeA
        })

        console.log('Chat rooms found:', chatRooms.length)
        callback(chatRooms)
      },
      (error) => {
        console.error('Error getting chat rooms:', error)
        callback([])
      }
    )
  } catch (error) {
    console.error('Error setting up chat rooms listener:', error)
    callback([])
  }
}

// Get messages for a chat room
export const getChatMessages = (chatRoomId, callback) => {
  const q = query(
    collection(db, 'chatRooms', chatRoomId, 'messages'),
    orderBy('timestamp', 'asc'),
    limit(100)
  )

  return onSnapshot(q, (querySnapshot) => {
    const messages = []
    querySnapshot.forEach((doc) => {
      messages.push({
        id: doc.id,
        ...doc.data()
      })
    })
    callback(messages)
  })
}

// Mark messages as read
export const markMessagesAsRead = async (chatRoomId, userId) => {
  try {
    const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages')
    // Get all unread messages first, then filter in memory to avoid composite index
    const q = query(messagesRef, where('read', '==', false))

    const querySnapshot = await getDocs(q)
    const updatePromises = querySnapshot.docs
      .filter((doc) => doc.data().senderId !== userId) // Filter in memory
      .map((doc) => updateDoc(doc.ref, { read: true }))

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }
    return { ok: true }
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return { ok: false, error: error.message }
  }
}

export const deleteChatRoom = async (chatRoomId) => {
  try {
    // Delete all messages in the chat room
    const messagesRef = collection(db, 'chatRooms', chatRoomId, 'messages')
    const messagesSnapshot = await getDocs(messagesRef)
    const deletePromises = messagesSnapshot.docs.map((msgDoc) =>
      deleteDoc(msgDoc.ref)
    )
    await Promise.all(deletePromises)

    // Delete the chat room itself
    await deleteDoc(doc(db, 'chatRooms', chatRoomId))
    return { ok: true }
  } catch (error) {
    console.error('Error deleting chat room:', error)
    return { ok: false, error: error.message }
  }
}

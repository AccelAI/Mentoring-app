import React from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import OrcidHandler from './OrcidHandler'

const RootHandler = () => {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const code = urlParams.get('code')

  if (code) {
    console.log('code', code)
    return <OrcidHandler />
  }
  return <Navigate to="/login" replace />
}

export default RootHandler

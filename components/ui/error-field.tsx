import React from 'react'

const ErrorField = ({ message }: { message: string | undefined }) => {
  return (
    message && <p className="text-red-500">{message}</p>
  )
}

export default ErrorField   
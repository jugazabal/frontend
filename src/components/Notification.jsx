import Alert from 'react-bootstrap/Alert'

const resolveVariant = (message) => {
  const normalized = message.toLowerCase()
  if (normalized.includes('error') || normalized.includes('fail')) {
    return 'danger'
  }
  if (normalized.includes('success') || normalized.includes('logged in')) {
    return 'success'
  }
  if (normalized.includes('expired') || normalized.includes('warning')) {
    return 'warning'
  }
  return 'info'
}

const Notification = ({ message }) => {
  if (!message) return null

  return (
    <Alert variant={resolveVariant(message)} className="mt-3">
      {message}
    </Alert>
  )
}

export default Notification

const Notification = ({ message }) => {
  if (!message) return null

  return <div className="banner-notification">{message}</div>
}

export default Notification

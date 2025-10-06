import { useSelector } from 'react-redux'

const labels = {
  increment: 'Incremented',
  decrement: 'Decremented',
  reset: 'Reset',
  set: 'Set to'
}

const CounterHistory = () => {
  const history = useSelector(state => state.counter.history)

  if (!history.length) {
    return <p className="empty">Interact with the counter to see history.</p>
  }

  return (
    <div className="history">
      <h2>Recent actions</h2>
      <ol>
        {history.map(entry => (
          <li key={entry.id}>
            <span className="event-label">{labels[entry.type]}</span>
            <span className="event-value">{entry.value}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default CounterHistory

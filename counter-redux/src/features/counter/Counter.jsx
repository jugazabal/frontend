import { useDispatch, useSelector } from 'react-redux'
import { decrement, increment, reset } from './counterSlice.js'

const Counter = () => {
  const dispatch = useDispatch()
  const value = useSelector(state => state.counter.value)

  return (
    <div className="counter">
      <span className="count" aria-live="polite">{value}</span>
      <div className="actions">
        <button type="button" onClick={() => dispatch(increment())}>Increment</button>
        <button type="button" onClick={() => dispatch(decrement())}>Decrement</button>
        <button type="button" onClick={() => dispatch(reset())}>Reset</button>
      </div>
    </div>
  )
}

export default Counter

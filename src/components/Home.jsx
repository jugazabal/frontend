import useCounter from '../hooks/useCounter'

const Home = () => {
  const left = useCounter()
  const right = useCounter()

  return (
    <div>
      <h2>Welcome to the Blog App</h2>
      <p>Use the navigation to view blogs, users, or login.</p>

      <div style={{ marginTop: '2rem' }}>
        <h3>Custom Hook Demo: useCounter</h3>
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <h4>Left Counter</h4>
            <div>{left.value}</div>
            <button onClick={left.increase}>+</button>
            <button onClick={left.decrease}>-</button>
            <button onClick={left.zero}>zero</button>
          </div>
          <div>
            <h4>Right Counter</h4>
            <div>{right.value}</div>
            <button onClick={right.increase}>+</button>
            <button onClick={right.decrease}>-</button>
            <button onClick={right.zero}>zero</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
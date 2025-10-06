import Counter from './features/counter/Counter.jsx'
import CounterHistory from './features/counter/CounterHistory.jsx'

const App = () => {
  return (
    <main className="app-shell">
      <header>
        <h1>Redux Counter</h1>
        <p>Demonstrating idiomatic React + Redux Toolkit structure.</p>
      </header>
      <section className="card">
        <Counter />
      </section>
      <section className="card">
        <CounterHistory />
      </section>
    </main>
  )
}

export default App

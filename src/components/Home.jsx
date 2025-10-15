import styled from 'styled-components'
import useCounter from '../hooks/useCounter'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`

const Hero = styled.section`
  background: linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%);
  padding: 2.5rem;
  border-radius: 1.5rem;
  color: #fff;
  box-shadow: 0 20px 35px rgba(13, 110, 253, 0.25);
`

const CountersSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const CountersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`

const CounterCard = styled.article`
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(13, 110, 253, 0.15);
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const CounterTitle = styled.h4`
  margin: 0;
  font-size: 1.2rem;
  color: #0d6efd;
`

const CounterValue = styled.div`
  font-size: clamp(2.5rem, 4vw, 3rem);
  font-weight: 700;
  color: #111827;
`

const CounterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const CounterButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.5rem 1.25rem;
  font-weight: 600;
  color: #ffffff;
  background: ${({ $variant }) => {
    if ($variant === 'decrease') return '#d63384'
    if ($variant === 'reset') return '#6c757d'
    return '#198754'
  }};
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(17, 24, 39, 0.15);
  }

  &:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: 3px;
  }
`

const Home = () => {
  const left = useCounter()
  const right = useCounter()

  return (
    <Page>
      <Hero>
        <h2 className="mb-3">Welcome to the Blog App</h2>
        <p className="mb-0">Browse the latest posts, explore authors, and manage your own content.</p>
      </Hero>

      <CountersSection>
        <div>
          <h3 className="mb-0">Custom Hook Demo: useCounter</h3>
          <p className="text-muted mb-0">Each counter is powered by the same hook instance, demonstrating isolated state.</p>
        </div>
        <CountersGrid>
          <CounterCard>
            <CounterTitle>Left Counter</CounterTitle>
            <CounterValue>{left.value}</CounterValue>
            <CounterActions>
              <CounterButton onClick={left.increase}>Increase</CounterButton>
              <CounterButton $variant="decrease" onClick={left.decrease}>Decrease</CounterButton>
              <CounterButton $variant="reset" onClick={left.zero}>Reset</CounterButton>
            </CounterActions>
          </CounterCard>
          <CounterCard>
            <CounterTitle>Right Counter</CounterTitle>
            <CounterValue>{right.value}</CounterValue>
            <CounterActions>
              <CounterButton onClick={right.increase}>Increase</CounterButton>
              <CounterButton $variant="decrease" onClick={right.decrease}>Decrease</CounterButton>
              <CounterButton $variant="reset" onClick={right.zero}>Reset</CounterButton>
            </CounterActions>
          </CounterCard>
        </CountersGrid>
      </CountersSection>
    </Page>
  )
}

export default Home
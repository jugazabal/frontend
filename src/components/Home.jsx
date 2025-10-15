import styled from 'styled-components'
import useCounter from '../hooks/useCounter'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: ${({ theme }) => theme.primaryText};
  transition: color 0.25s ease;
`

const Hero = styled.section`
  background: ${({ theme }) => theme.heroBackground};
  padding: 2.5rem;
  border-radius: 1.5rem;
  color: ${({ theme }) => theme.heroText};
  border: 1px solid ${({ theme }) => theme.heroBorder};
  box-shadow: ${({ theme }) => theme.heroShadow};
  transition: background 0.35s ease, color 0.25s ease, box-shadow 0.35s ease;
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
  background: ${({ theme }) => theme.cardBg};
  border-radius: 1.25rem;
  padding: 1.75rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  border: 1px solid ${({ theme }) => theme.cardBorder};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: ${({ theme }) => theme.primaryText};
  transition: background 0.35s ease, box-shadow 0.35s ease, border 0.35s ease;
`

const CounterTitle = styled.h4`
  margin: 0;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.accent};
`

const CounterValue = styled.div`
  font-size: clamp(2.5rem, 4vw, 3rem);
  font-weight: 700;
  color: ${({ theme }) => theme.counterText};
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
  color: ${({ theme }) => theme.buttonText};
  background: ${({ theme, $variant }) => {
    if ($variant === 'decrease') return theme.danger
    if ($variant === 'reset') return theme.neutral
    return theme.success
  }};
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.hoverShadow};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.accent};
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
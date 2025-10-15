import styled from 'styled-components'
import useCounter from '../hooks/useCounter'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  color: ${({ theme }) => theme.textPrimary};
`

const Hero = styled.section`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 16px;
  padding: clamp(1.75rem, 3vw, 2.5rem);
  box-shadow: ${({ theme }) => theme.cardShadow};
`

const HeroTitle = styled.h2`
  margin: 0 0 1.5rem;
  font-size: clamp(2.2rem, 3vw, 2.6rem);
  color: ${({ theme }) => theme.heading};
`

const HeroParagraph = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.muted};
  line-height: 1.75;

  & + & {
    margin-top: 1.25rem;
  }
`

const CounterSection = styled.section`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
`

const CounterCard = styled.article`
  background: ${({ theme }) => theme.surface};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: ${({ theme }) => theme.cardShadow};
  display: grid;
  gap: 1rem;
`

const CounterHeading = styled.h3`
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: ${({ theme }) => theme.muted};
`

const CounterValue = styled.div`
  font-size: clamp(2.5rem, 5vw, 3.2rem);
  font-weight: 700;
  color: ${({ theme }) => theme.heading};
`

const CounterActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`

const ControlButton = styled.button`
  border: none;
  border-radius: 999px;
  padding: 0.55rem 1.4rem;
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  background: var(--color-button-bg);
  color: var(--color-button-text);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 30px rgba(61, 82, 160, 0.22);
  }

  &:focus-visible {
    outline: 2px solid var(--color-link);
    outline-offset: 4px;
  }
`

const Footnote = styled.p`
  margin: 0;
  font-style: italic;
  color: ${({ theme }) => theme.footerText};
`

const Home = () => {
  const left = useCounter()
  const right = useCounter()

  return (
    <Page>
      <Hero>
        <HeroTitle>TKTL notes app</HeroTitle>
        <HeroParagraph>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
          been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer took
          a galley of type and scrambled it to make a type specimen book. It has survived not only five
          centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
        </HeroParagraph>
        <HeroParagraph>
          It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum
          passages, and more recently with desktop publishing software like Aldus PageMaker including
          versions of Lorem Ipsum.
        </HeroParagraph>
      </Hero>

      <CounterSection>
        <CounterCard>
          <CounterHeading>Left counter</CounterHeading>
          <CounterValue>{left.value}</CounterValue>
          <CounterActions>
            <ControlButton type="button" onClick={left.increase}>Increase</ControlButton>
            <ControlButton type="button" onClick={left.decrease}>Decrease</ControlButton>
            <ControlButton type="button" onClick={left.zero}>Reset</ControlButton>
          </CounterActions>
        </CounterCard>
        <CounterCard>
          <CounterHeading>Right counter</CounterHeading>
          <CounterValue>{right.value}</CounterValue>
          <CounterActions>
            <ControlButton type="button" onClick={right.increase}>Increase</ControlButton>
            <ControlButton type="button" onClick={right.decrease}>Decrease</ControlButton>
            <ControlButton type="button" onClick={right.zero}>Reset</ControlButton>
          </CounterActions>
        </CounterCard>
      </CounterSection>

      <Footnote>Note app, Department of Computer Science 2020</Footnote>
    </Page>
  )
}

export default Home
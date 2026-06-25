import './App.css'
import { useHouseTheme } from './theme/useHouseTheme'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section1 from './components/Section1'
import Section2 from './components/Section2'

function App() {
  useHouseTheme()

  return (
    <>
    <Navbar />
    <Hero />
    <Section1 />
    <Section2 />
    </>
  )
}

export default App

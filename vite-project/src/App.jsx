import './App.css'
import { useState } from 'react'
import { useHouseTheme } from './theme/useHouseTheme'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Section1 from './components/Section1'
import Section2 from './components/Section2'

function App() {
  useHouseTheme()
  const [openedHouse, setOpenedHouse] = useState(null)

  const handleEnterHouse = (id) => {
    setOpenedHouse(id)
    requestAnimationFrame(() => {
      document.getElementById('houses')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  return (
    <>
    <Navbar />
    <Hero />
    <Section1 onEnterHouse={handleEnterHouse} />
    <Section2 openedHouse={openedHouse} onCloseHouse={() => setOpenedHouse(null)} />
    </>
  )
}

export default App

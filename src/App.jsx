import { useState } from 'react'
import Joining from './pages/Joining'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Joining />
    </>
  )
}

export default App

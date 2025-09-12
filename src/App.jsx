import { useState } from 'react'
import JoiningForm from './pages/Joining'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <JoiningForm />
    </>
  )
}

export default App

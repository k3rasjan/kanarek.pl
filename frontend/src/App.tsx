import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        Strona główna
        <a href="Login.tsx">Zaloguj się</a>
    </>
  )
}

export default App

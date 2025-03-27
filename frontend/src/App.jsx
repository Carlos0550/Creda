import React from 'react'
import { Routes, Route } from "react-router-dom"

import "./App.css"

import AuthenticationManager from './Authentication/AuthenticationManager'
function App() {
  return (
    <div className='main-container'>
      <Routes>
        <Route path='/' element={<AuthenticationManager />} />
      </Routes>
    </div>
  )
}

export default App
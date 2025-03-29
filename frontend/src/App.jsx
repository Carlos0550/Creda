import React from 'react'
import { Routes, Route } from "react-router-dom"

import "./App.css"

import AuthComponentManager from './Authentication/AuthComponentManager'
function App() {
  return (
    <div className='main-container'>
      <Routes>
        <Route path='/' element={<AuthComponentManager />} />
      </Routes>
    </div>
  )
}

export default App
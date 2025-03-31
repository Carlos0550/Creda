import React from 'react'
import { Routes, Route } from "react-router-dom"

import "./App.css"

import AuthComponentManager from './Authentication/AuthComponentManager'
import Home from './Home/Home'
import Layout from './Layout/Layout'
function App() {
  return (
    <div className='main-container'>
      <Routes>
        <Route path='/' element={<AuthComponentManager />} />
        <Route path='/home/:user_id' element={<Layout content={<Home/>}/>}/>
      </Routes>
    </div>
  )
}

export default App
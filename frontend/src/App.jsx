import React from 'react'
import { Routes, Route } from "react-router-dom"

import "./App.css"

import AuthComponentManager from './Authentication/AuthComponentManager'
import Home from './Home/Home'
import Layout from './Layout/Layout'
import ProtectedRoute from './Authentication/ProtectedRoute'

function App() {
  return (
    <div className='main-container'>
      <Routes>
        <Route path='/' element={<AuthComponentManager />} />
        <Route path='/home' element={<AuthComponentManager />} />
        <Route element={<ProtectedRoute />}> 
          <Route path='/home/:manager_id' element={<Layout content={<Home />} />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
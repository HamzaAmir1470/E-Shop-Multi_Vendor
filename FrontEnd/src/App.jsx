import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import {LoginPage, SignupPage} from './Routes.js'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/sign-up" element={<SignupPage />} />
      </Routes>
    </Router>
  )
}

export default App
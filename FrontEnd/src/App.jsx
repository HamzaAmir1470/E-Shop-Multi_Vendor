import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import {LoginPage} from './Routes.js'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App
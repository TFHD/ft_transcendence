import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BabylonPage from "./pages/Babylonjs";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/babylon" element={<BabylonPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
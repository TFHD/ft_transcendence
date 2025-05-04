import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PongPage from "./pages/Babylonjs";
import LobbyPage from "./pages/Lobby";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/pong" element={<PongPage/>}/>
        <Route path="/lobby" element={<LobbyPage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
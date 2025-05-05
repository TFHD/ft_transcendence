import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PongPage from "./pages/Babylonjs";
import LobbyPage from "./pages/Lobby";
import RegisterPage from "./pages/RegisterPage";
import StartGamePratice from "./pages/StartGamePractice"
import StartGameMultiplayer from "./pages/StartGameMultiplayer"
import PlayerSettings from "./pages/PlayerSettings"

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/pong" element={<PongPage/>}/>
          <Route path="/lobby" element={<LobbyPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/start-game-practice" element={<StartGamePratice/>}/>
          <Route path="/start-game-multiplayer" element={<StartGameMultiplayer/>}/>
          <Route path="/settings" element={<PlayerSettings/>}/>
        </Routes>
      </Router>
  );
};

export default App;
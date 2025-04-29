import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import UserForm from './pages/UserForm';
import BabylonPage from "./pages/Babylonjs";
import Users from "./pages/Users";
import Login from "./pages/Login";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/about" element={<AboutPage/>}/>
        <Route path="/contact" element={<ContactPage/>}/>
        <Route path="/users" element={<UserForm/>}/>
        <Route path="/babylon" element={<BabylonPage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/userslist" element={<Users/>}/>
      </Routes>
    </Router>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import UserForm from './pages/UserForm';
import BabylonPage from "./pages/Babylonjs";
import Pong from "./pages/Pong";

const App = () => {
  return (
    <Router>
	  <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/users" element={<UserForm />} />
        <Route path="/babylon" element={<BabylonPage />} />
        <Route path="/pong" element={<Pong />} />
      </Routes>
    </Router>
  );
};

export default App;
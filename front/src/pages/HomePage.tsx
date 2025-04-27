import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {

  const navigate = useNavigate();
  const fetchLabel = async (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/babylon");

  };

  return (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <div>
      <h1 className="text-4xl font-bold text-blue-500 mb-6">
        Bienvenue sur ft_transcendence !
      </h1>
    </div>
    <div className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
        <a href="#" onClick={fetchLabel}>Commencer</a>
    </div>
  </div>
  );
};

export default HomePage;
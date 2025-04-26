import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header>
      <nav>
        <ul className="flex gap-4 p-4 bg-gray-200">
          <li className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><Link to="/">Accueil</Link></li>
          <li className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><Link to="/about">À propos</Link></li>
          <li className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><Link to="/contact">Contact</Link></li>
          <li className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"><Link to="/users">Users</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
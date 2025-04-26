import React from 'react';
import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div>
      <h1>Page de Contact</h1>
      <p>Contactez-nous pour plus d'informations !</p>
      <nav className="mt-5">
        <ul>
          <li>
            <Link to="/" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Retour à l'accueil</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default ContactPage;
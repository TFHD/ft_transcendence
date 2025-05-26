import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Gros 404 stylé */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-black text-[#1e2933] leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-6xl md:text-8xl font-black text-[#f7c80e] animate-pulse">
              404
            </h1>
          </div>
        </div>

        {}
        <div className="bg-[#1e2933] rounded-lg p-8 mb-8 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page introuvable 💀
          </h2>
          <p className="text-[#5d5570] text-lg mb-6">
            Oops ! On dirait que cette page s'est téléportée dans une autre dimension.
            <br />
            Même nos meilleurs développeurs n'arrivent pas à la retrouver.
          </p>
          
          {}
          <div className="bg-[#0b0c10] rounded-lg p-4 border-l-4 border-[#44a29f] mb-6">
            <p className="text-[#44a29f] italic">
              "Il n'y a que deux choses infinies dans l'univers : l'univers et les erreurs 404"
            </p>
            <p className="text-[#5d5570] text-sm mt-2">- Un développeur fatigué</p>
          </div>
        </div>

        {}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/"
            className="px-8 py-3 bg-[#44a29f] hover:bg-[#3b8b89] text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
          >
            🏠 Retour à l'accueil
          </Link>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-[#5d5570] hover:bg-gray-600 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105"
          >
            ← Page précédente
          </button>
        </div>

        {}
        <div className="relative">
          <div className="text-[#44a29f] text-xl font-mono animate-bounce">
            &gt; ERROR_PAGE_NOT_FOUND
          </div>
          <div className="text-[#5d5570] text-sm mt-2 font-mono">
            Stack trace: Universe.exe has stopped working
          </div>
        </div>

        {}
        <div className="mt-12 text-[#5d5570] text-xs">
          <p>Code d'erreur: 404_DIMENSION_LOST</p>
          <p>Si le problème persiste, essayez de redémarrer l'univers 🌌</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
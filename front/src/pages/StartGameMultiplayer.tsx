import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StartGameMultiplayer: React.FC = () => {
  const navigate = useNavigate();

  const [roomId, setRoomId] = useState('');
  const [isTournamentMode, setIsTournamentMode] = useState(false);

  const handlePlay = () => {
    console.log('Room ID:', roomId);
    console.log('Mode tournoi:', isTournamentMode);
    navigate('/play');
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0b0c10] text-white font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-80 p-6 bg-[#1e2933] flex flex-col justify-between">
        <div>
          {/* Bouton retour */}
          <button
            onClick={() => navigate('/lobby')}
            className="mb-6 w-full bg-[#5d5570] text-white py-2 rounded-lg hover:bg-[#3c434b] transition"
          >
            ⬅️ Retour
          </button>

          {/* Statistiques */}
          <h2 className="text-[#f7c80e] text-xl mb-4">Stats</h2>
          <p className="text-lg">👨 Pseudo: Player1</p>
          <p className="text-lg">🏆 Wins: 12</p>
          <p className="text-lg">💀 Losses: 5</p>
          <p className="text-lg">🎮 Last Game: vs. John</p>
        </div>

        {/* Formulaire multijoueur */}
        <div>
          <h3 className="text-[#f7c80e] text-lg mb-4">Rejoindre une Room</h3>

          {/* Input ID de room */}
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Entrez l'ID de la room"
            className="w-full px-4 py-2 mb-4 text-black rounded-md"
          />

          {/* Toggle mode tournoi */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-white text-md pr-4">Mode Tournoi</span>
            <button
              onClick={() => setIsTournamentMode(!isTournamentMode)}
              className={`w-12 h-6 rounded-full ${isTournamentMode ? 'bg-[#44a29f]' : 'bg-[#5d5570]'} relative`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full absolute top-0 ${isTournamentMode ? 'right-0' : 'left-0'} transition-all duration-300`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Section Play */}
      <div className="flex-1 flex justify-center md:justify-end items-center pr-10 pt-6 md:pt-0">
        <button
          onClick={handlePlay}
          disabled={!roomId.trim()}
          className={`text-white text-2xl py-3 px-8 rounded-lg transition ${
            roomId.trim()
              ? 'bg-[#5d5570] hover:bg-[#3c434b]'
              : 'bg-gray-500 cursor-not-allowed'
          }`}
        >
          ▶️ Play
        </button>
      </div>
    </div>
  );
};

export default StartGameMultiplayer;
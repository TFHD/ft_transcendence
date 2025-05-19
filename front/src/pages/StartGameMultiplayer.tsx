import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckToken, generateTimeBasedId } from "../components/CheckConnection";
import '../styles/globals.css';
import axios from 'axios';

const host = window.location.hostname;

type Match = {
  id: number;
  winner_id: number;
  looser_id: string;
  winner_username: string;
  looser_username: string;
  winner_score: number;
  looser_score: number;
  game_mode: string;
  time: string;
};

const StartGameMultiplayer = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Match[]>([]);
  const [tournamentUsername, setTournamentUsername] = useState('');
  const [userData, setUserData] = useState({
    username: "",
    win: 0,
    losses: 0,
    lastGameOpponent: "nobody"
  });

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) navigate("/");
    });

    const getInfos = async () => {
      const reponse = await axios.get(`https://${host}:8000/api/users/@me`, {
        withCredentials: true,
      });
      setUserData({ ...userData,
        username: reponse.data.username, 
        win: reponse.data.multiplayer_win,
        losses: reponse.data.multiplayer_loose,
      });
      if (reponse.data.last_opponent)
        setUserData({ ...userData,
          username: reponse.data.username, 
          win: reponse.data.multiplayer_win,
          losses: reponse.data.multiplayer_loose,
          lastGameOpponent: reponse.data.last_opponent
        });
        const historyResponse = await axios.get(`https://${host}:8000/api/history/@me`, {
          withCredentials: true,
        });
        setHistory(historyResponse.data.history);
    }
    getInfos();
  }, [navigate]);

  const [roomId, setRoomId] = useState('');
  const [isTournamentMode, setIsTournamentMode] = useState(false);

  const handlePlay = async () => {
    if (isTournamentMode)
    {
      try {
        const game = await axios.get(`https://${host}:8000/api/games/${roomId}`, {
          withCredentials: true,
        });
        if (!game.data) {
          navigate(`/tournament/${roomId}`, { state: { fromStartGame: true, roomID: roomId, join: "new", username: tournamentUsername } });
        }
        else if (game.data && game.data.players + 1 <= game.data.limit)
          navigate(`/tournament/${roomId}`, { state: { fromStartGame: true, roomID: roomId, join: "exist", username: tournamentUsername } });
      } catch (e) { console.log(e); }
    }
    else
      navigate(`/pong/duo`, { state: { fromStartGame: true, roomID: roomId } });
  };

  const isValid = isTournamentMode ? (roomId.length === 6 && tournamentUsername.trim().length > 0) : (roomId.length === 6);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0b0c10] text-white font-sans overflow-hidden">
    <div className="w-full md:w-80 p-6 bg-[#1e2933] flex flex-col justify-between">
      <div>
        <button
          onClick={() => navigate('/lobby')}
          className="mb-6 w-full bg-[#5d5570] text-white py-2 rounded-lg hover:bg-[#3c434b] transition"
        >
          ⬅️ Retour
        </button>
        <h2 className="text-[#f7c80e] text-xl mb-4">📊 Statistiques</h2>
        <p className="text-lg">👨 Pseudo: {userData!.username}</p>
        <p className="text-lg">🏆 Victoires: {userData!.win}</p>
        <p className="text-lg">💀 Défaites: {userData!.losses}</p>
        <p className="text-lg">🎮 Dernier match: vs. {userData!.lastGameOpponent}</p>
      </div>
      <div>
        <h3 className="text-[#f7c80e] text-lg mb-4">🏠 Rejoindre une Room</h3>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="ID de la room"
          className="w-full px-4 py-2 mb-4 text-black rounded-md"
          maxLength={6}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && isValid) {
              handlePlay();
            }
          }}
        />
        {isTournamentMode && (
          <input
            type="text"
            value={tournamentUsername}
            onChange={(e) => setTournamentUsername(e.target.value)}
            placeholder="Votre pseudo pour le tournoi"
            className="w-full px-4 py-2 mb-4 text-black rounded-md"
            maxLength={15}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && isValid) {
                handlePlay();
              }
            }}
          />
        )}
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

    <div className="flex-1 flex flex-col p-6 overflow-hidden">
      <h2 className="text-2xl font-bold mb-4 text-center text-[#f7c80e]">📜 Historique des matchs</h2>
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-custom">
        {history.length === 0 ? (
          <p className="text-center text-gray-400">Aucun match joué pour l'instant.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((match) => {
              const isWin = match.winner_username === userData.username;
              return (
                <li key={match.id} className="bg-[#1f2a38] rounded-md p-4 shadow-md flex justify-between items-center">
                  <div>
                    <div className={`font-semibold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {(() => {
                      const isDraw = match.winner_score === match.looser_score;
                      const isWin = match.winner_username === userData.username;
                      return (
                        <p className={`font-semibold ${
                          isDraw ? 'text-yellow-400'
                          : isWin ? 'text-green-400'
                          : 'text-red-400'
                        }`}>
                          {isDraw ? '⚖️ Égalité' : isWin ? '✅ Victoire' : '❌ Défaite'}
                        </p>
                      );
                    })()}
                    </div>
                    <p>
                      <Link to={`/profil/${match.winner_id}`}>{match.winner_username}</Link> 🆚 <Link to={`/profil/${match.looser_id}`}>{match.looser_username}</Link>
                    </p>
                  </div>
                  <span className="text-sm text-gray-400 text-right">
                    🎯 {match.winner_score} - {match.looser_score}<br />
                    🕹️ {match.game_mode}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="flex justify-center mt-6">
      <button
        onClick={handlePlay}
        disabled={!isValid}
        className={`text-white text-xl py-3 px-8 rounded-lg transition ${
          isValid
            ? 'bg-[#21A51D] hover:bg-[#1C8918]'
            : 'bg-gray-500 cursor-not-allowed'
        }`}
      >
        ▶️ Lancer la partie
      </button>
      </div>
    </div>
  </div>
  );
};

export default StartGameMultiplayer;
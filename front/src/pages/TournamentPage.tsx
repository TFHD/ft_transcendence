import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckToken } from '../components/CheckConnection';
import axios from 'axios';

let ws:WebSocket | null = null;
const host = import.meta.env.VITE_ADDRESS;

const TournamentPage = () => {

  const wsRef = useRef<WebSocket | null>(null);
  const [canStart, setCanStart] = useState<boolean>(false);
  const [gameInfos, setGameInfos] = useState({
    id: "",
    mode: "",
    players: 0,
    limit: 0,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const fromStartGame = location.state?.fromStartGame;
  const roomID = location.state?.roomID;
  const username = location.state?.username;
  const typeJoin = location.state?.join;
  const isTerminal = false;

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) navigate("/");
    });

    if (!fromStartGame)
      navigate("/start-game-multiplayer");

    if (!ws)
    {
      ws = new WebSocket(`wss://${host}:8000/api/pong/tournament?tournamentID=${roomID}&username=${username}&terminal=${isTerminal}&typeJoin=${typeJoin}`);
      wsRef.current = ws;
    }

    ws.onopen = () =>
    {
      console.log('Successfully connected to server');
    };

    ws.onmessage = (message) =>
    {
      const server_packet = JSON.parse(message.data);
      if (server_packet.canStart != undefined)
        setCanStart(server_packet.canStart);
      if (server_packet.id) {
        setGameInfos({...gameInfos, 
          id: server_packet.id,
          mode: server_packet.mode,
          players: server_packet.players,
          limit: server_packet.limit,
        });
      }
    };

    ws.onclose = (event) =>
    {
      console.log('Disconnected from server', event.code, event.reason);
      ws = null;
    };

    ws.onerror = (e) =>
    {
      console.log('Connection error', e);
    };
    return () =>
    {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
        wsRef.current.close(1000, "Page quittée");
    }

  }, [navigate]);




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
          <h2 className="text-[#f7c80e] text-xl mb-4">🏆 Informations Tournoi</h2>
          <p className="text-lg">👤 Pseudo: <span className="font-semibold">[{username}]</span></p>
          <p className="text-lg">🎮 Jeu: Pong {gameInfos.mode}</p>
          <p className="text-lg">📅 Date: [Date du tournoi]</p>
          <p className="text-lg">👥 Joueurs inscrits: {gameInfos.players} / 8</p>
        </div>
        <div>
          <h3 className="text-[#f7c80e] text-lg mb-4">📌 Statut</h3>
          <p className="text-md text-green-400">🟢 En cours</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#f7c80e]">🏁 Arbre du tournoi</h2>
        
        <div className="flex flex-col gap-8 items-center overflow-auto max-h-full scrollbar-custom">
          <div className="flex justify-center items-center gap-8">
            <div className="bg-[#1f2a38] px-4 py-2 rounded-lg shadow text-center">
              Player 1<br/>vs<br/>Player 2
            </div>
            <div className="bg-[#1f2a38] px-4 py-2 rounded-lg shadow text-center">
              Player 3<br/>vs<br/>Player 4
            </div>
            <div className="bg-[#1f2a38] px-4 py-2 rounded-lg shadow text-center">
              Player 5<br/>vs<br/>Player 6
            </div>
            <div className="bg-[#1f2a38] px-4 py-2 rounded-lg shadow text-center">
              Player 7<br/>vs<br/>Player 8
            </div>
          </div>

          <div className="flex justify-center gap-24 mt-6">
            <div className="bg-[#334155] px-4 py-2 rounded-md shadow text-center">
              Winner M1<br/>vs<br/>Winner M2
            </div>
            <div className="bg-[#334155] px-4 py-2 rounded-md shadow text-center">
              Winner M3<br/>vs<br/>Winner M4
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <div className="bg-[#475569] px-6 py-3 rounded-md shadow-lg text-center font-semibold text-[#f7c80e]">
              🏆 Finale : Winner SF1 vs Winner SF2
            </div>
          </div>
        </div>
        {canStart && (
          <div className="flex justify-center mt-6">
            <button
              className="bg-[#f7c80e] text-[#0b0c10] px-6 py-3 rounded-md shadow-lg text-center font-semibold">
              Lancer la partie
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentPage;
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckToken } from '../components/CheckConnection';
import { connectTournamentSocket, closeTournamentSocket } from '../components/SocketTournamentManager';
import { connectGateWaySocket, getGatewaySocket, closeGateWaySocket} from '../components/GatewaySocket'
import ChatWindow from '../components/ChatWindow';


const host = window.location.hostname;
let ws:WebSocket | null = null;

const TournamentPage = () => {

  const wsRef                     = useRef<WebSocket | null>(null);
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const fromStartGame             = location.state?.fromStartGame;
  const finish                    = location.state?.finish;
  const roomID                    = location.state?.roomID;
  const roundPlayed               = location.state?.roundPlayed;
  const matchPlayed               = location.state?.matchPlayed;
  const username                  = location.state?.username;
  let matchToPlay                 = 0;
  let roundToPlay                 = 0;
  const [canStart, setCanStart]   = useState<boolean>(false);
  const [canPlay, setcanPlay]     = useState<boolean>(false);
  const [gameInfos, setGameInfos] = useState({
    id: "",
    mode: "",
    players: 0,
    limit: 0,
    state : "default",
  });

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) { navigate("/"); closeGateWaySocket(); } 
      if (!getGatewaySocket()) {
            connectGateWaySocket(`https://${host}:8000/api/gateway`); console.log("connexion reussie !");}
    });

    if (!fromStartGame)
      navigate("/start-game-multiplayer");

    if (finish) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)
          wsRef.current.send(JSON.stringify({ finish: true, matchPlayed : matchPlayed, roundPlayed : roundPlayed }));
  }

    ws = connectTournamentSocket(`wss://${host}:8000/api/pong/tournament?tournamentID=${roomID}&username=${username}`);
    wsRef.current = ws;

    ws.onmessage = (message) =>
    {
      const server_packet = JSON.parse(message.data);
      if (server_packet.alreadyInUse != undefined && server_packet.alreadyInUse == true) {
        closeTournamentSocket();
        navigate("/start-game-multiplayer", {state : { cantJoin : true}})
      }
      if (server_packet.canStart != undefined)
        setCanStart(server_packet.canStart);
      if (server_packet.id) {
        setGameInfos(prev => ({...prev, id: server_packet.id, mode: server_packet.mode, players: server_packet.players,
                                        limit: server_packet.limit, state: server_packet.state }));
        if (server_packet.state == "Finish") {
          closeTournamentSocket();
          navigate("/start-game-multiplayer");
        }
      }
      if (server_packet.canPlay != undefined && server_packet.matchToPlay != undefined && server_packet.roundToPlay != undefined) {
        setcanPlay(server_packet.canPlay);
        matchToPlay = server_packet.matchToPlay;
        roundToPlay = server_packet.roundToPlay;
      }
      if (server_packet.goPlay) {
        navigate("/pong/duo", { state: { fromStartGame: true, username : username, match : matchToPlay, round: roundToPlay,
                                roomID : server_packet.roomID, game_id : server_packet.game_id, isTournament : true }});
      }
      if (server_packet.stop)
      {
        ws?.close();
        navigate("/lobby");
      }
    };

    ws.onopen = () => { console.log('Successfully connected to server'); };
    ws.onclose = (event) => { console.log('Disconnected from server', event.code, event.reason); };
    ws.onerror = (e) => { console.log('Connection error', e); };
    return () => {}

  }, [navigate, finish, matchPlayed, roundPlayed]);

  const handleStart = () => { wsRef.current?.send(JSON.stringify({ start: true })); };
  const handlecanPlay = () => { wsRef.current?.send(JSON.stringify({ canPlay: true })); };

  const generateTournamentTree = (numPlayers: number) => {
    const rounds: number[][] = [];
    let matches = Math.floor(numPlayers / 2);
    while (matches >= 1) {
      rounds.push(new Array(matches).fill(0));
      matches = Math.floor(matches / 2);
    }
    return rounds;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0b0c10] text-white font-sans overflow-hidden">
      <div className="w-full md:w-80 p-6 bg-[#1e2933] flex flex-col justify-between">
        <div>
          <button
            onClick={() => {closeTournamentSocket(); navigate('/start-game-multiplayer')}}
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
          {(() => 
          {
            const waiting = gameInfos.state === "En attente";
            return (
              <p className={`font-semibold ${waiting ? 'text-yellow-400' : 'text-green-400'}`}>
                {waiting ? '🟡 ' : '🟢 '} {gameInfos.state}
              </p>
            );
          }
          )()}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#f7c80e]">🏁 Arbre du tournoi</h2>
        

        <div className="flex flex-col gap-8 items-center overflow-auto max-h-full scrollbar-custom">
          {generateTournamentTree(gameInfos.players).map((round, roundIndex) => (
            <div key={roundIndex} className="flex justify-center items-center gap-8 mt-6">
              {round.map((_, matchIndex) => {
                const label =
                  roundIndex === 0 ? `Player ${matchIndex * 2 + 1} vs Player ${matchIndex * 2 + 2}` : roundIndex === generateTournamentTree(gameInfos.players).length - 1
                      ? `🏆 Finale : Winner SF${matchIndex * 2 + 1} vs Winner SF${matchIndex * 2 + 2}` : `Winner M${matchIndex * 2 + 1} vs Winner M${matchIndex * 2 + 2}`;

                const bgColor =
                  roundIndex === 0
                    ? 'bg-[#1f2a38]'
                    : roundIndex === generateTournamentTree(gameInfos.players).length - 1
                      ? 'bg-[#475569] text-[#f7c80e] font-semibold'
                      : 'bg-[#334155]';

                return (
                  <div key={matchIndex} className={`${bgColor} px-4 py-2 rounded-md shadow text-center`}>
                    {label.split(' vs ').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i === 0 && <br />}
                        {i === 0 && 'vs'}
                        {i === 0 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {canStart && (
          <div className="flex justify-center mt-6">
            <button
              className="bg-[#f7c80e] text-[#0b0c10] px-6 py-3 rounded-md shadow-lg text-center font-semibold"
              onClick={() => { handleStart() }}>
              Lancer la partie
            </button>
          </div>
        )}
      </div>
      {canPlay && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-md shadow-lg font-semibold"
            onClick={handlecanPlay}
          >
            ▶️ Rejoindre la partie
          </button>
        </div>
      )}
      <ChatWindow />
    </div>
  );
};

export default TournamentPage;
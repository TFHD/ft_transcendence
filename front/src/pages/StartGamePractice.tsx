import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckToken, generateTimeBasedId } from "../components/CheckConnection";
import axios from 'axios';

const host = window.location.hostname;

interface IAOption {
  name: string;
  isActive: boolean;
}


const StartGamePractice = () => {
  const navigate = useNavigate();
    const [userData, setUserData] = useState({
      username: "",
      win: 0,
      losses: 0,
      lastGameOpponent: "IA"
    });

    useEffect(() => {
      CheckToken().then(res => {
        if (!res)
          navigate("/");
        });

    const getInfos = async () => {
      const reponse = await axios.get(`https://${host}:8000/api/users/@me`, {
        withCredentials: true,
      });
      setUserData({ ...userData,
        username: reponse.data.username, 
        win: reponse.data.practice_win,
        losses: reponse.data.practice_loose,
      });
    }
    getInfos();
    }, []);

  const [options, setOptions] = useState<IAOption[]>([
    { name: 'Mode difficile', isActive: false },
    { name: 'Utiliser la stratégie avancée', isActive: true },
    { name: 'Mode aléatoire', isActive: false }
  ]);

  const handleToggle = (index: number) => {
    const newOptions = [...options];
    newOptions[index].isActive = !newOptions[index].isActive;
    setOptions(newOptions);
  };

  const handleValidate = () => {
    navigate(`/pong/practice`, { state: { fromStartGame: true, gameMode : "practice" } });
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#0b0c10] text-white font-sans">
      <div className="w-full md:w-80 p-6 bg-[#1e2933] flex flex-col justify-between">
      <button
        onClick={() => navigate('/lobby')}
        className="mb-6 w-full bg-[#5d5570] text-white py-2 rounded-lg hover:bg-[#3c434b] transition"
        > ⬅️ Retour </button>
        <div>
          <h2 className="text-[#f7c80e] text-xl mb-4">Stats</h2>
          <p className="text-lg">👨 Pseudo: {userData!.username}</p>
          <p className="text-lg">🏆 Wins: {userData!.win}</p>
          <p className="text-lg">💀 Losses: {userData!.losses}</p>
          <p className="text-lg">🎮 Last Game: vs. {userData!.lastGameOpponent}</p>
        </div>

        <div>
          <h3 className="text-[#f7c80e] text-lg mb-4">Options de l'IA</h3>
          {options.map((option, index) => (
            <div key={index} className="flex justify-between items-center mb-4">
              <span className="text-white text-md pr-4">{option.name}</span>
              <button
                onClick={() => handleToggle(index)}
                className={`w-12 h-6 rounded-full ${option.isActive ? 'bg-[#44a29f]' : 'bg-[#5d5570]'} relative`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full absolute top-0 ${option.isActive ? 'right-0' : 'left-0'} transition-all duration-300`}
                ></div>
              </button>
            </div>
          ))}
          <button
            onClick={handleValidate}
            className="w-full bg-[#5d5570] text-white py-3 text-lg rounded-lg mt-4 hover:bg-[#3c434b] transition"
          >
            Valider
          </button>
        </div>
      </div>

      <div className="flex-1 flex justify-center md:justify-end items-center pr-10 pt-6 md:pt-0">
        <button
          onClick={handleValidate}
          className="bg-[#5d5570] text-white text-2xl py-3 px-[100px] rounded-lg hover:bg-[#3c434b] transition"
        >
          ▶️ Play
        </button>
      </div>
    </div>
  );
};

export default StartGamePractice;
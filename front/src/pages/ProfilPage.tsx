import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckToken } from "../components/CheckConnection";
import axios from 'axios';

const host = window.location.hostname;

type User = {
  username: string;
  avatar_url: string;
  multiplayer_win: number;
  multiplayer_loose: number;
  last_opponent: string;
};

const ProfilPage = () => {
  const username = window.location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    CheckToken().then(res => {
      if (!res)
        navigate("/");
      });
    const fetchUser = async () => {
      try {
        const res = await axios.get(`https://${host}:8000/api/users/${username}`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
        console.error('Erreur de récupération du profil utilisateur :', err);
      }
    };

    if (username) fetchUser();
  }, [username]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white p-6">
        <p className="text-center text-gray-400">Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-[#5d5570] text-white py-2 px-4 rounded-lg hover:bg-[#3c434b] transition"
      >
        ⬅️ Retour
      </button>

      <div className="bg-[#1e2933] p-6 rounded-lg shadow-md flex items-start gap-6 max-w-xl mx-auto">
        <img
          src={user.avatar_url || '/assets/no_profile.jpg'}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-[#44a29f] shrink-0"
        />
        <div>
          <h1 className="text-3xl font-bold text-[#f7c80e] mb-2">{user.username}</h1>
          <p className="text-lg">🏆 Victoires : {user.multiplayer_win}</p>
          <p className="text-lg">💀 Défaites : {user.multiplayer_loose}</p>
          <p className="text-lg">🎮 Dernier adversaire : {user.last_opponent || 'nobody'}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilPage;
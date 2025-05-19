import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckToken } from "../components/CheckConnection";

const host = window.location.hostname;

type User = {
  user_id: string;
  username: string;
  multiplayer_win: number;
  multiplayer_loose: number;
  last_opponent: string;
  avatar_url: string;
};

const SearchPage = () => {
    const search = window.location.pathname.split("/")[2];
    const [users, setUsers] = useState<User[]>([]);
    const [searched, setSearch] = useState('');
    const navigate = useNavigate();

    const handleSearch = () => {
      navigate(`/search/${searched}`);
    };

    useEffect(() => {
      CheckToken().then(res => {
        if (!res)
          navigate("/");
        });
        const fetchUsers = async () => {
        try {
            const res = await axios.get(`https://${host}:8000/api/search/${search}`, {
            withCredentials: true,
            });
            setUsers(res.data.users);
        } catch (err) {
            console.error("Erreur lors de la recherche des utilisateurs :", err);
        }
        };

        if (search) {
        fetchUsers();
        }
    }, [search]);

    return (
      <div className="min-h-screen bg-[#0b0c10] text-white p-6 overflow-y-auto">
        <div className="absolute top-5 right-5 z-10">
          <div className="absolute top-1 right-5 z-10">
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <svg
                className="w-5 h-5 text-white mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.48-4.48A7 7 0 1110 3a7 7 0 018.13 9.17z" />
              </svg>
              <input
                type="text"
                maxLength={42}
                placeholder="Rechercher un profil..."
                className="bg-transparent outline-none text-white placeholder-white w-40 sm:w-64"
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && search != "") {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
        </div>
        <button
            onClick={() => navigate('/lobby')}
            className="mb-6 bg-[#5d5570] text-white py-2 px-4 rounded-lg hover:bg-[#3c434b] transition"
        >
            ⬅️ Retour
        </button>

        <h1 className="text-3xl font-bold text-[#f7c80e] mb-6 text-center">
            🔍 Résultats pour "{search}"
        </h1>

        {users.length === 0 ? (
            <p className="text-center text-gray-400">Aucun utilisateur trouvé.</p>
        ) : (
            <div className="space-y-6">
            {users.map((user) => (
                <div
                key={user.username}
                className="bg-[#1e2933] p-4 rounded-lg shadow-md hover:bg-[#1B252E] cursor-pointer"
                onClick={() => navigate(`/profil/${user.user_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl text-[#f7c80e]">{user.username}</h2>
                    <p className="text-md">🏆 Victoires: {user.multiplayer_win}</p>
                    <p className="text-md">💀 Défaites: {user.multiplayer_loose}</p>
                    <p className="text-md">🎮 Dernier match: vs. {user.last_opponent || 'nobody'}</p>
                  </div>
                  <img
                    src={user.avatar_url || '/assets/no_profile.jpg'}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#44a29f] ml-6"
                  />
                </div>
              </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default SearchPage;
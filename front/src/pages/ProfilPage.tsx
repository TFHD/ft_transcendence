import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckToken } from "../components/CheckConnection";
import axios from 'axios';
import { getGatewaySocket, connectGateWaySocket, addGatewayListener, removeGatewayListener, closeGateWaySocket } from "../components/GatewaySocket";
import ChatWindow from '../components/ChatWindow';

const host = window.location.hostname;
let ws1: WebSocket | null = null;

type User = {
  id: number;
  username: string;
  avatar_url: string;
  multiplayer_win: number;
  multiplayer_loose: number;
  last_opponent: string;
  created_at?: string;
  updated_at?: string;
  last_seen?: string;
};

type FriendRelation = {
  type: number;
  initiator_id : number;
  user: User;
};

const ProfilPage = () => {
  const username = window.location.pathname.split("/")[2];
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [friendsList, setFriendsList] = useState<FriendRelation[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRelation[]>([]);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [alreadyFriend, setAlreadyFriend] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockRelation, setBlockRelation] = useState<FriendRelation | null>(null);
  const [blockError, setBlockError] = useState(false);
  const [onlineMap, setOnlineMap] = useState<{ [userId: number]: boolean }>({});

  const isOwnProfile = me && user && me.id === user.id;

  useEffect(() => {
    const fetchMe = async () => {
      const res = await axios.get(`https://${host}:8000/api/users/@me`, { withCredentials: true });
      setMe(res.data);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) { navigate("/"); closeGateWaySocket(); }
      ws1 = getGatewaySocket();
      if(!ws1) {
        ws1 = connectGateWaySocket(`wss://${host}:8000/api/gateway`);
      }
    });

    const fetchUser = async () => {
      try {
        const res = await axios.get(`https://${host}:8000/api/users/${username}`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err) {
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username, navigate]);

  function parseMySQLUTC(dateStr: string): number {
    return new Date(dateStr.replace(' ', 'T') + 'Z').getTime();
  }

  const computeOnlineMap = (friends: FriendRelation[]): { [userId: number]: boolean } => {
    const map: { [userId: number]: boolean } = {};
    const now = Date.now();
    friends.forEach(fr => {
      if (!fr.user.last_seen) {
        map[fr.user.id] = false;
      } else {
        const lastSeen = parseMySQLUTC(fr.user.last_seen);
        map[fr.user.id] = (now - lastSeen) < 35000;
      }
    });
    return map;
  };

  const fetchRelations = async () => {
    if (!user || !me) return;
    try {
      const res = await axios.get(
        `https://${host}:8000/api/users/${user.id}/friends`,
        { withCredentials: true }
      );

      const friends: FriendRelation[] = [];
      const requests: FriendRelation[] = [];
      let blockRel: FriendRelation | null = null;
      let hasPendingRequest = false;

      for (const relation of res.data as FriendRelation[]) {
        if (relation.type === 2) {
          blockRel = relation;
        }
        if (relation.type === 1) friends.push(relation);
        else if (relation.type === 0 && me.id === user.id) {
          requests.push(relation);
        }
        else if (relation.type === 0 && relation.initiator_id === me.id) {
          hasPendingRequest = true;
        }
      }

      setBlockRelation(blockRel);
      setIsBlocked(!!blockRel);
      setFriendsList(friends);
      setFriendRequests(requests);
      setIsRequestSent(hasPendingRequest);
      
      const amIFriend = friends.some((relation) => relation.user.id === me!.id || (isOwnProfile && relation.user.id !== me!.id));
      setAlreadyFriend(amIFriend);
      
      return friends;
    } catch (err) {}
  };

  useEffect(() => {
    if (user && me) {
      fetchRelations().then(friends => {
        if (friends) {
          setOnlineMap(computeOnlineMap(friends));
        }
      });
    }
  }, [user, me]);

  useEffect(() => {
    if (!ws1 || !me) return;
    ws1.onclose = (event) => { ws1 = null; };

    const handler = (message: MessageEvent) => {
		const gateway = JSON.parse(message.data);
		
		if (gateway.op === "user_online" && gateway.data?.user)
			setOnlineMap(prev => ({ ...prev, [gateway.data.user.user_id]: true }));
		if (gateway.op === "user_offline" && gateway.data?.user)
			setOnlineMap(prev => ({ ...prev, [gateway.data.user.user_id]: false }));
			
		if (gateway.op === "friends_add" && gateway.data && gateway.data.user) {
			const addedFriend = gateway.data.user;
			
			setFriendsList(prev => {
				if (prev.some(f => f.user.id === addedFriend.id)) return prev;
				return [...prev, { type: 1, initiator_id: gateway.initiator_id, user: addedFriend }];
			});
			setFriendRequests(prev => prev.filter(req => req.user.id !== addedFriend.id));
			if (user && user.id === addedFriend.id) {
				setAlreadyFriend(true);
				setIsRequestSent(false);
			}
			const isOnline = addedFriend.last_seen ? 
				(Date.now() - parseMySQLUTC(addedFriend.last_seen) < 35000) : false;
			setOnlineMap(prev => ({ 
				...prev, 
				[addedFriend.id]: isOnline
			}));
		}
		if (gateway.op === "friends_remove" && gateway.data && gateway.data.user) {
			const removedUser = gateway.data.user;
			
			setFriendsList(prev => prev.filter(f => f.user.id !== removedUser.id));
			setFriendRequests(prev => prev.filter(req => req.user.id !== removedUser.id));
			
			setOnlineMap(prev => {
				const { [removedUser.id]: removed, ...rest } = prev;
				return rest;
			});
			
			if (user && user.id === removedUser.id) {
				setAlreadyFriend(false);
				setIsRequestSent(false);
			}
		}

		if (gateway.op === "friends_block" && gateway.data && gateway.data.user) {
			if (me && gateway.data.user.id === me.id) {
				setIsBlocked(true);
				setAlreadyFriend(false);
				setBlockRelation({
					type: 2,
					initiator_id: gateway.initiator_id,
					user: me,
				});
			}
			if (user && gateway.data.user.id === user.id) {
				setIsBlocked(true);
				setAlreadyFriend(false);
				setBlockRelation({
					type: 2,
					initiator_id: user.id,
					user: user,
				});
			}
		}

		if (gateway.op === "friends_request" && gateway.data && gateway.data.user) {
			const requestUser = gateway.data.user;

			if (isOwnProfile) {
				setFriendRequests(prev => {
					if (prev.some(req => req.user.id === requestUser.id)) return prev;
					return [...prev, { type: 0, initiator_id: gateway.initiator_id, user: requestUser }];
				});
			}
		}
	};
    addGatewayListener(handler);
    return () => {
      removeGatewayListener(handler);
    };
  }, [ws1, me, isOwnProfile, user]);

  const sendFriendRequest = async (userId: number) => {
    try {
      await axios.put(`https://${host}:8000/api/users/${me!.id}/friends/${userId}`, { type: 1 }, { withCredentials: true });
      setIsRequestSent(true);
    } catch (err) {}
  };

  const blockUser = async (userId: number) => {
    try {
      await axios.put(`https://${host}:8000/api/users/@me/friends/${userId}`, { type: 2 }, { withCredentials: true });
      setIsBlocked(true);
      setAlreadyFriend(false);
      setIsRequestSent(false);
      setBlockError(false);
      if (user) {
        setBlockRelation({ type: 2, initiator_id: me!.id, user: user });
      }
    } catch (err) {
      setBlockError(true);
    }
  };

  const unblockUser = async (userId: number) => {
    try {
      await axios.delete(`https://${host}:8000/api/users/${me!.id}/friends/${userId}`, { withCredentials: true });
      setIsBlocked(false);
      setBlockRelation(null);
      setAlreadyFriend(false);
      setBlockError(false);
    } catch (err) {
      setBlockError(true);
    }
  };

  const acceptFriendRequest = async (userId: number) => {
    try {
      await axios.put(`https://${host}:8000/api/users/${me!.id}/friends/${userId}`, { type: 1 }, { withCredentials: true });
    } catch (err) {}
  };

  const deleteFriend = async (userId: number) => {
    try {
      await axios.delete(`https://${host}:8000/api/users/${me!.id}/friends/${userId}`, { withCredentials: true });
    } catch (err) {}
  };

  const cancelFriendRequest = async (userId: number) => {
    try {
      await axios.delete(`https://${host}:8000/api/users/${me!.id}/friends/${userId}`, { withCredentials: true });
    } catch (err) {}
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0c10] text-white p-6">
        <p className="text-center text-gray-400">Chargement du profil...</p>
      </div>
    );
  }

  function FriendCard({avatar, username, onDelete, online, onBlock, onUnblock, blocked, initiator_id}: {
    avatar: string;
    username: string;
    onDelete: () => void;
    online: boolean;
    onBlock: () => void;
    onUnblock: () => void;
    blocked: boolean;
    initiator_id?: number;
  }) {
    const canUnblock = blocked && initiator_id === me?.id;
    return (
      <div className="flex items-center bg-[#23242d] rounded-xl p-3 pr-4 mb-3 shadow-md hover:shadow-2xl transition relative group">
        <div className="relative">
          <img
            src={avatar || '/assets/no_profile.jpg'}
            alt="Ami"
            className="w-12 h-12 rounded-full border-2 border-[#44a29f] object-cover"
          />
          <span
            className={`absolute right-0 bottom-0 block w-4 h-4 rounded-full border-2 ${
              online ? 'bg-green-500 border-green-200' : 'bg-gray-400 border-gray-300'
            }`}
            title={online ? 'En ligne' : 'Hors ligne'}
          ></span>
        </div>
        <span className="ml-4 text-lg font-bold text-[#f7c80e]">{username}</span>
        {isOwnProfile && (
          <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={onDelete}
              className="bg-[#e74c3c] text-white p-2 rounded-full hover:bg-[#c0392b] transition"
              title="Retirer l'ami"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <path stroke="white" strokeWidth="2" d="M6 6l8 8M14 6l-8 8" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  function RequestCard({ avatar, username, onAccept, onCancel }: { avatar: string, username: string, onAccept: () => void, onCancel: () => void }) {
    return (
      <div className="flex items-center bg-[#23242d] rounded-xl p-3 pr-4 mb-3 shadow-md hover:shadow-2xl transition">
        <img src={avatar || '/assets/no_profile.jpg'} alt="Demande" className="w-12 h-12 rounded-full border-2 border-[#44a29f] object-cover" />
        <span className="ml-4 text-lg font-bold text-white">{username}</span>
        <button onClick={onAccept} className="ml-auto bg-[#27ae60] text-white px-3 py-1 rounded-full hover:bg-[#2ecc71] transition mr-2" title="Accepter">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M5 10.5l3.5 3.5L15 7" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
        <button onClick={onCancel} className="bg-[#e74c3c] text-white px-3 py-1 rounded-full hover:bg-[#c0392b] transition" title="Refuser">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path stroke="white" strokeWidth="2" d="M6 6l8 8M14 6l-8 8"/></svg>
        </button>
      </div>
    );
  }

  function AddFriendButton() {
    let state = "add";
    if (alreadyFriend) state = "friend";
    else if (isRequestSent) state = "pending";

    const canUnblock = blockRelation && blockRelation.type === 2 && blockRelation.initiator_id === me?.id;
    const isBlockedByOther = blockRelation && blockRelation.type === 2 && blockRelation.initiator_id !== me?.id;

    return (
      <div className="fixed bottom-10 right-10 z-50 flex gap-2">
        {canUnblock ? (
          <button
            onClick={() => unblockUser(user!.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full shadow-xl text-lg font-bold
              ${blockError ? "bg-orange-400 text-white" : "bg-[#44a29f] text-white hover:bg-[#36a97f] transition"}`}
            title="Débloquer"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill={blockError ? "#f39c12" : "#44a29f"} /><path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            {blockError ? "Tu es bloqué" : "Débloquer"}
          </button>
        ) : isBlockedByOther ? (
          <button
            className="flex items-center gap-2 bg-orange-400 text-white px-6 py-3 rounded-full shadow-xl text-lg font-bold cursor-not-allowed"
            disabled
            title="Tu es bloqué"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#f39c12" />
              <path d="M6 6l12 12M18 6l-12 12" stroke="white" strokeWidth="2" />
            </svg>
            Tu es bloqué
          </button>
        ) : (
          <>
          {state === "add" && (
            <button
              onClick={() => sendFriendRequest(user!.id)}
              className="flex items-center gap-2 bg-[#2980b9] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#3498db] transition text-lg font-bold"
              title="Ajouter en ami"
            >
              <span className="text-2xl">+</span> Ajouter
            </button>
          )}
          {state === "pending" && (
            <button
              className="flex items-center gap-2 bg-[#95a5a6] text-white px-6 py-3 rounded-full shadow-xl cursor-not-allowed text-lg font-bold"
              disabled
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#bfc9ca" /><path d="M7 12l3 3 7-7" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
              Demande envoyée
            </button>
          )}
          {state === "friend" && (
            <button
              onClick={() => deleteFriend(user!.id)}
              className="flex items-center gap-2 bg-[#e74c3c] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#c0392b] transition text-lg font-bold"
              title="Retirer l'ami"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="white" strokeWidth="2" d="M6 6l12 12M18 6l-12 12" />
              </svg>
              Retirer l'ami
            </button>
          )}
          {!isOwnProfile && !isBlocked && !alreadyFriend && (
            <button
              onClick={() => blockUser(user!.id)}
              className="flex items-center gap-2 bg-[#f39c12] text-white px-6 py-3 rounded-full shadow-xl hover:bg-[#e67e22] transition text-lg font-bold"
              title="Bloquer"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#f39c12" /><path d="M6 6l12 12M18 6l-12 12" stroke="white" strokeWidth="2" /></svg>
              Bloquer
            </button>
          )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0c10] to-[#2c3e50] text-white p-6">
      <button onClick={() => navigate(-1)} className="mb-6 bg-[#5d5570] text-white py-2 px-4 rounded-lg hover:bg-[#3c434b] transition">
        ⬅️ Retour
      </button>

      <div className="bg-[#1e2933] p-6 rounded-2xl shadow-2xl flex items-center gap-8 max-w-xl mx-auto mt-6">
        <img src={user.avatar_url || '/assets/no_profile.jpg'} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-[#44a29f] shadow-lg transition-transform transform hover:scale-105" />
        <div>
          <h1 className="text-4xl font-extrabold text-[#f7c80e] mb-2 drop-shadow">{user.username}</h1>
          <div className="flex flex-col gap-2 text-lg">
            <span>🏆 <span className="font-bold text-[#44a29f]">{user.multiplayer_win}</span> Victoires</span>
            <span>💀 <span className="font-bold text-[#e74c3c]">{user.multiplayer_loose}</span> Défaites</span>
            <span>🎮 Dernier adversaire : <span className="font-semibold text-[#f7c80e]">{user.last_opponent || 'nobody'}</span></span>
          </div>
        </div>
      </div>

      {!isOwnProfile && <AddFriendButton />}

      <div className="my-10 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold text-[#f7c80e] mb-4 flex items-center gap-3">
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="#f7c80e" strokeWidth="2" /><circle cx="10" cy="7" r="4" stroke="#f7c80e" strokeWidth="2" /></svg>
          Amis
        </h2>
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {friendsList.length === 0 ? (
            <p className="text-center text-gray-400">{isOwnProfile ? "Vous n'avez aucun ami pour le moment." : `${user.username} n'a pas d'amis pour le moment.`}</p>
          ) : (
            friendsList.map((relation) => (
              <FriendCard
                key={relation.user.id}
                avatar={relation.user.avatar_url || '/assets/no_profile.jpg'}
                username={relation.user.username}
                onDelete={() => deleteFriend(relation.user.id)}
                online={!!onlineMap[relation.user.id]}
                onBlock={() => blockUser(relation.user.id)}
                onUnblock={() => unblockUser(relation.user.id)}
                blocked={relation.type === 2}
                initiator_id={relation.initiator_id}
              />
            ))
          )}
        </div>
      </div>
      {isOwnProfile && (
        <div className="my-10 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-[#f7c80e] mb-4 flex items-center gap-3">
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" stroke="#f7c80e" strokeWidth="2" /><circle cx="10" cy="7" r="4" stroke="#f7c80e" strokeWidth="2" /></svg>
            Demandes d'Amis
          </h2>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {friendRequests.length === 0 ? (
              <p className="text-center text-gray-400">Aucune demande en attente.</p>
            ) : (
              friendRequests.map((req) => (
                <RequestCard
                  key={req.user.id}
                  avatar={req.user.avatar_url || '/assets/no_profile.jpg'}
                  username={req.user.username}
                  onAccept={() => acceptFriendRequest(req.user.id)}
                  onCancel={() => cancelFriendRequest(req.user.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
          background: #23242d;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #44a29f;
          border-radius: 8px;
        }
      `}</style>
      <ChatWindow/>
    </div>
  );
};

export default ProfilPage;
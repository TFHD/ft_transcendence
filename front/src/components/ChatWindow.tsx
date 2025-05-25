import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { getGatewaySocket, connectGateWaySocket } from "./GatewaySocket";

const host = window.location.hostname;

type User = {
  id: number;
  username: string;
  avatar_url: string;
};

type Friend = {
  user: User;
  type: number;
};

type Message = {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  timestamp: string;
};

export default function ChatWindow() {
  const [open, setOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [me, setMe] = useState<User | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const selectedFriendRef = useRef<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [viewMode, setViewMode] = useState<"friends" | "chat">("friends");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { selectedFriendRef.current = selectedFriend; }, [selectedFriend]);

  useEffect(() => {
    axios.get(`https://${host}:8000/api/users/@me`, { withCredentials: true })
      .then(res => setMe(res.data));
  }, []);

  useEffect(() => {
    if (!me) return;
    axios.get(`https://${host}:8000/api/users/${me.id}/friends`, { withCredentials: true })
      .then(res => {
        setFriends(res.data.filter((f: Friend) => f.type === 1));
      });
  }, [me]);

  useEffect(() => {
	if (!me || !selectedFriend) return;
	setMessages([]);
	setOffset(0);
	setHasMore(true);
	fetchMessages(0, true).then(() => {
	  requestAnimationFrame(() => {
		if (scrollContainerRef.current) {
		  scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
		}
	  });
	});
  }, [selectedFriend, me]);
  
  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }
    });
  };

  const fetchMessages = async (currentOffset: number, reset = false): Promise<void> => {
	setLoading(true);
	return axios.get(`https://${host}:8000/api/users/@me/messages/${selectedFriend?.id}?limit=50&offset=${currentOffset}`, { withCredentials: true })
	  .then(res => {
		const newMessages = res.data.map((msg: any) => ({
		  ...msg,
		  message: msg.message ?? msg.content,
		}));
		newMessages.reverse();
		
		if (newMessages.length < 50) setHasMore(false);
  
		setMessages(prev => reset ? newMessages : [...newMessages, ...prev]); 
		setOffset(currentOffset + 50);
	  })
	  .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!me) return;
    if (!ws.current) {
      ws.current = getGatewaySocket() || connectGateWaySocket(`wss://${host}:8000/api/gateway`);
    }
    const socket = ws.current;

    socket.onmessage = (event) => {
		try {
		  const data = JSON.parse(event.data);
	  
		  if (data.op === "message_send") {
			const newMsg = {
			  message_id: data.data.message_id,
			  sender_id: Number(data.data.sender_id),
			  receiver_id: Number(me?.id),
			  message: data.data.content || data.data.message,
			  timestamp: data.data.timestamp,
			};
			
			if (selectedFriendRef.current && newMsg.sender_id === Number(selectedFriendRef.current.id)) {
			  setMessages(prev => {
				if (prev.some(m => m.message_id === newMsg.message_id)) return prev;
				const newMessages = [...prev, newMsg];
				setTimeout(scrollToBottom, 50);
				return newMessages;
			  });
			}
		  }
		  if (data.op === "message_delete") {
			setMessages(prev => prev.filter(m => m.message_id !== Number(data.data.message_id)));
		  }
		} catch {}
	  };
    return () => { if (socket) socket.onmessage = null; };
  }, [me]);

  const handleSend = async (e?: React.FormEvent) => {
	if (e) e.preventDefault();
	if (!message.trim() || !selectedFriend || !me) return;
	
	const msgToSend = message;
	setMessage("");
	
	try {
	  const res = await axios.post(
		`https://${host}:8000/api/users/@me/messages/${selectedFriend.id}`,
		{ 
		  message: msgToSend,
		  timestamp: new Date().toISOString()
		},
		{ withCredentials: true }
	  );
	  
	  const newMsg = {
		...res.data,
		message: res.data.content || res.data.message,
		sender_id: Number(me.id),
		receiver_id: Number(selectedFriend.id),
		timestamp: res.data.timestamp || new Date().toISOString()
	  };
	  
	  setMessages(prev => {
		if (prev.some(m => m.message_id === newMsg.message_id)) return prev;
		return [...prev, newMsg];
	  });
	  
	  scrollToBottom();
	} catch (err) {
	  setMessage(msgToSend);
	}
  };

  const handleDelete = async (msgId: number) => {
    try {
      await axios.delete(`https://${host}:8000/api/messages/${msgId}`, { withCredentials: true });
	  setMessages(prev => prev.filter(m => m.message_id !== msgId));
    } catch (err) {
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const chatBoxClass =
    "fixed z-50 bottom-4 right-4 w-[90vw] max-w-md sm:max-w-sm md:w-96 h-[60vh] sm:h-96 md:h-[36rem] " +
    "bg-[#1e2933] border-2 border-[#44a29f] rounded-2xl shadow-2xl flex flex-col overflow-hidden";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button onClick={() => setOpen(true)}
          className="bg-[#44a29f] text-white shadow-xl rounded-full w-14 h-14 flex items-center justify-center hover:bg-[#36a97f] transition duration-200 border-4 border-[#0b0c10]">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="11" fill="#44a29f" />
            <path d="M17 8h-10m10 4h-10m7 4h-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {open && (
        <div className={chatBoxClass} style={{ boxShadow: "0 8px 32px 0 #0b0c1080" }}>
          <div className="flex items-center justify-between px-4 py-2 bg-[#0b0c10] border-b-2 border-[#44a29f]">
            <span className="font-bold text-[#f7c80e] text-lg tracking-wide">Chat</span>
            <button onClick={() => setOpen(false)}
              className="text-[#44a29f] hover:text-red-400 font-bold text-xl ml-2 bg-transparent p-1 rounded">
              &times;
            </button>
          </div>
          <div className="flex-1 flex overflow-hidden bg-[#1e2933]">
            {viewMode === "friends" && (
              <div className="flex flex-col flex-1 h-full overflow-y-auto">
                <div className="p-3 text-sm text-[#f7c80e] border-b border-[#44a29f] font-semibold bg-[#23242d]">
                  <span>Choisis un ami</span>
                </div>
                <div className="flex-1 overflow-y-auto py-2 px-1">
                  {friends.length === 0 && (
                    <div className="text-center text-gray-400 py-8">Aucun ami disponible</div>
                  )}
                  {friends.map(friend => (
                    <button key={friend.user.id}
                      onClick={() => {
                        setSelectedFriend(friend.user);
                        setViewMode("chat");
                      }}
                      className="flex items-center gap-2 w-full py-2 px-2 rounded-lg hover:bg-[#23242d] transition mb-1">
                      <img src={friend.user.avatar_url || "/assets/no_profile.jpg"} className="w-10 h-10 rounded-full border-2 border-[#44a29f]" />
                      <span className="text-sm text-white truncate font-medium">{friend.user.username}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {viewMode === "chat" && (
              <div className="flex-1 flex flex-col h-full">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#23242d] border-b border-[#44a29f]">
                  <button
                    onClick={() => setViewMode("friends")}
                    className="p-1 rounded hover:bg-[#5d5570] transition mr-1"
                    title="Retour à la liste"
                  >
                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                      <path d="M13 16l-5-5 5-5" stroke="#f7c80e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <img src={selectedFriend?.avatar_url || "/assets/no_profile.jpg"} className="w-8 h-8 rounded-full border-2 border-[#44a29f]" />
                  <span className="font-bold text-[#f7c80e] text-base truncate"><Link to={`/profil/${selectedFriend?.id}`}>{selectedFriend?.username}</Link></span>
                </div>
                <div
                  ref={scrollContainerRef}
                  onScroll={() => {
					const container = scrollContainerRef.current;
					if (!container || container.scrollTop !== 0 || !hasMore || loading) return;
				  
					const oldScrollHeight = container.scrollHeight;
				  
					fetchMessages(offset).then(() => {
					  requestAnimationFrame(() => {
						const newScrollHeight = container.scrollHeight;
						const scrollDelta = newScrollHeight - oldScrollHeight;
						container.scrollTop += scrollDelta;
					  });
					});
				  }}
                  className="flex-1 overflow-y-auto px-2 py-2 bg-[#1e2933]"
                >
                  {loading && messages.length === 0 ? (
                    <div className="text-center text-gray-400 pt-8">Chargement...</div>
                  ) : (
                    messages.map(m => {
                      const isMyMessage = Number(m.sender_id) === Number(me?.id);
                      return (
                        <div key={m.message_id}
                          className={`flex items-end gap-1 mb-2 ${isMyMessage ? "justify-end" : "justify-start"}`}>
                          {!isMyMessage && (
                            <img src={selectedFriend?.avatar_url || "/assets/no_profile.jpg"} className="w-7 h-7 rounded-full mr-1" />
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 max-w-[60vw] md:max-w-[18rem] break-words shadow
                              ${isMyMessage
                                ? "bg-[#44a29f] text-white rounded-br-[0.6rem]"
                                : "bg-[#5d5570] text-white rounded-bl-[0.6rem]"}`
                            }
                          >
                            <span style={{ wordBreak: "break-word" }}>{m.message}</span>
                            <span className="block text-xs text-[#f7c80e] mt-1 text-right whitespace-nowrap">
                              {formatTimestamp(m.timestamp)}
                            </span>
                          </div>
                          {isMyMessage &&
                            <button onClick={() => handleDelete(m.message_id)}
                              title="Supprimer"
                              className="text-gray-300 hover:text-red-500 ml-1 text-xs">
                              ✕
                            </button>}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex items-center gap-2 px-2 py-2 border-t border-[#23242d] bg-[#1e2933]">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Écrire un message..."
                    className="flex-1 bg-[#23242d] text-white placeholder-[#5d5570] px-3 py-2 rounded-xl border border-[#44a29f] focus:outline-none focus:border-[#f7c80e] text-sm"
                    maxLength={1000}
                    disabled={loading}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) { 
                        e.preventDefault();
                        handleSend(); 
                      }
                    }}
                  />
                  <button type="submit"
                    className="px-4 py-2 rounded-xl bg-[#f7c80e] text-[#0b0c10] font-bold hover:bg-[#44a29f] hover:text-white transition"
                    disabled={loading || !message.trim()}>
                    Envoyer
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 600px) {
          .fixed.bottom-4.right-4.z-50 > div {
            width: 98vw !important;
            min-width: 0 !important;
            right: 0 !important;
            left: 0 !important;
            border-radius: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}
let socket: WebSocket | null = null;

export function getTournamentSocket() {
  return socket;
}

export function connectTournamentSocket(url: string): WebSocket {
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      socket = new WebSocket(url);
    }
    return socket;
  }

export function closeTournamentSocket(code = 1000, reason = "Fermeture manuelle") {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(code, reason);
  }
  socket = null;
}
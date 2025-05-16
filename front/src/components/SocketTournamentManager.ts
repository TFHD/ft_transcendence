let socket: WebSocket | null = null;

export function getSocket() {
  return socket;
}

export function connectSocket(url: string): WebSocket {
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      socket = new WebSocket(url);
    }
    return socket;
  }

export function closeSocket(code = 1000, reason = "Fermeture manuelle") {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(code, reason);
  }
  socket = null;
}
let socket: WebSocket | null = null;

export function getGatewaySocket() {
  return socket;
}

export function connectGateWaySocket(url: string): WebSocket {
    if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
      socket = new WebSocket(url);
    }
    return socket;
  }

export function closeGateWaySocket(code = 1000, reason = "Fermeture manuelle") {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(code, reason);
  }
  socket = null;
}

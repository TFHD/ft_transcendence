let socket: WebSocket | null = null;
let listeners: ((event: MessageEvent) => void)[] = [];

export function getGatewaySocket() {
  return socket;
}

export function connectGateWaySocket(url: string): WebSocket {
  if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
    socket = new WebSocket(url);
    socket.onmessage = (event: MessageEvent) => {
      listeners.forEach(fn => fn(event));
    };
  }
  return socket;
}

export function closeGateWaySocket(code = 1000, reason = "Fermeture manuelle") {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(code, reason);
  }
  socket = null;
}

export function addGatewayListener(fn: (event: MessageEvent) => void) {
  listeners.push(fn);
}

export function removeGatewayListener(fn: (event: MessageEvent) => void) {
  listeners = listeners.filter(f => f !== fn);
}
import React, { useEffect, useRef } from 'react';

let ws:WebSocket|null = null;

const Pong = () => {
	const wsRef = useRef(null);
	const host = import.meta.env.VITE_ADRESS;

	useEffect(() => {
	ws = new WebSocket(`ws://${host}:8000/api/pong/test`);
    wsRef.current = ws;

    console.log('gros caca');

    ws.onopen = () =>
	{
    	console.log('Connected to server');
    	// ws?.send(JSON.stringify({ msg: 'caca' }));
    	console.log('Entre les 2');
    	// ws?.send('Hello, server!');
    };

    ws.onmessage = (message) =>
	{
		console.log(`Received message from server: ${message.data}`);
    };

    ws.onclose = (event) =>
	{
    	console.log('Disconnected from server', event.code, event.reason);
		ws = null;
    };

    ws.onerror = (e) =>
	{
    	console.log('Connection erroreuh', e);
    };

    return () =>
	{
    	console.log('Fermeture WebSocket');
    };
  }, []);

  const handleDisconnect = () => {
    console.log("test");
    wsRef.current?.close();
  };

  const handleInputish = () => {
    console.log("pressing");
	const response = fetch(`http://${host}:8000/api/pong/input`);
  };

  return (
    <div>
      <h1 className="mb-5">Test websocket</h1>
	  <button onClick={handleDisconnect}>Disconnect</button>
	  <button onClick={handleInputish}>Send something to back</button>
    </div>
  );
};

export default Pong;
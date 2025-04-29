import React, { useState } from 'react';

const Pong = () => {

	const ws = new WebSocket('ws://10.12.7.1:8000/api/pong/test')


	ws.onopen = () =>
		{
		ws.send(JSON.stringify({msg: 'caca'}))
		console.log('Connected to server');
	  
		ws.send('Hello, server!');
	  };
	  
	ws.onmessage = (message) =>
	{
		console.log(`Received message from server: ${message}`);
	};
	  
	  ws.onclose = (event) =>
		{
		console.log('Disconnected from server', event.code, event.reason);
	  };

	  ws.onerror = (e) => {
		console.log('COnnection closed', e);
	  };

	return (
	<div>
	  <h1 className="mb-5">Test websocket</h1>
	</div>
  );
};

export default Pong;
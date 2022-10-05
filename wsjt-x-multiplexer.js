#!/usr/bin/env node

import udp from 'node:dgram';
import { decode } from './parser.js';
import WebsocketServer from './websocket-server.js';

const PORT = 2239;

// program flow:
// start server on PORT
// when WSJT-X connects, store the src port so we know which messages are from WSJT-X
// create connections for our client applications, e.g. RUMLogNG and GridTracker
// when we receive messages from WSJT-X, forward to our clients
// when we receive messages from our clients, forward to WSJT-X

const CLIENTS = {
  2237: 'RUMLogNG',
  2238: 'GridTracker',
};

const client = udp.createSocket('udp4');
const server = udp.createSocket('udp4');

let WSJTX_PORT;

function toJson(object) {
  return JSON.parse(
    JSON.stringify(object, (_, value) => (typeof value === 'bigint' ? value.toString() : value)),
  );
}

const websocketServer = new WebsocketServer();

client.on('message', (msg, info) => {
  console.log(`CLIENT (${CLIENTS[info.port] ?? 'Unknown'})`, decode(msg));
  websocketServer.publish('client-message', { client: info.port, message: toJson(decode(msg)) });

  if (WSJTX_PORT) {
    client.send(msg, WSJTX_PORT, 'localhost', (error) => {
      if (error) {
        console.error(error.message);
      }
    });
  }
});

server.on('listening', () => {
  const address = server.address();
  const { port } = address;

  console.log(`WSJT-X server is listening on port ${port}`);
});

server.on('message', (msg, info) => {
  console.log('WSJT-X', decode(msg));
  websocketServer.publish('wsjt-x-message', toJson(decode(msg)));

  if (!WSJTX_PORT) {
    console.log(`WSJT-X connected from ${info.port}`);
  } else if (WSJTX_PORT !== info.port) {
    console.log(`WSJT-X reconnected from ${info.port}`);
  }

  WSJTX_PORT = info.port;

  for (const port of Object.keys(CLIENTS)) {
    client.send(msg, parseInt(port, 10), 'localhost', (error) => {
      if (error) {
        console.error(error.message);
      }
    });
  }
});

server.on('error', (error) => {
  console.error(`Error: ${error.message}`);
  server.close();
});

server.bind(PORT);

websocketServer.listen();

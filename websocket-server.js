import uws from 'uWebSockets.js';
import { v4 } from 'uuid';

const WEBSOCKET_PORT = 2240;

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

function fromWire(message) {
  return JSON.parse(textDecoder.decode(message));
}

function toWire(message) {
  return textEncoder.encode(JSON.stringify(message));
}

export default class WebsocketServer {
  publish(topic, message) {
    this.ws.publish(topic, toWire(message));
  }

  listen() {
    this.ws = uws
      .App()
      .ws('/', {
        compression: uws.SHARED_COMPRESSOR,
        maxPayloadLength: 16 * 1024 * 1024,
        idleTimeout: 60,

        open: (ws) => {
          ws.send(toWire({ type: 'connected' }));

          this.addListener(ws);
        },

        message: (_ws, message) => {
          try {
            const json = fromWire(message);
            console.log({ json });
          } catch (e) {
            console.error(`Error parsing message: ${e.message}`);
          }
        },

        drain: (ws) => {
          console.log(`WebSocket backpressure: ${ws.getBufferedAmount()}`);
        },

        // ping
        // pong

        close: (ws, code, message) => {
          this.removeListener(ws, code, textDecoder.decode(message));
        },
      })
      .any('/', (res) => {
        res.writeHeader('Content-Type', 'text/html');
        res.end('<!DOCTYPE html><html><head><title>ok</title></head><body>ok</body></html>', true);
      })
      // @ts-ignore
      .listen(WEBSOCKET_PORT, uws.LIBUS_LISTEN_EXCLUSIVE_PORT, (token) => {
        if (token) {
          console.log(`WebSocket server listening to port ${WEBSOCKET_PORT}`);
        } else {
          console.log(`Failed to listen to port ${WEBSOCKET_PORT}`);
          process.exit(1);
        }
      });
  }

  addListener(ws) {
    // eslint-disable-next-line no-param-reassign
    ws.id = v4();

    this.connections[ws.id] = ws;
    this.connectionCount++;

    ws.subscribe('wsjt-x-message');
    ws.subscribe('client-message');

    console.log('connect', { count: this.connectionCount });

    this.ws.publish('join', toWire({ type: 'join', id: ws.id, count: this.connectionCount }));
  }

  removeListener(ws, code, message) {
    console.log(`WebSocket closed: ${ws.id}, ${code}, "${message}"`);

    delete this.connections[ws.id];
    this.connectionCount--;

    console.log('disconnect', { count: this.connectionCount });

    this.ws.publish('leave', toWire({ type: 'leave', id: ws.id, count: this.connectionCount }));
  }

  constructor() {
    this.connections = {};
    this.connectionCount = 0;

    this.ws = null;
  }
}

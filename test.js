#!/usr/bin/env node

import { decode } from './parser.js';
import {
  clear,
  close,
  freeText,
  haltTx,
  heartbeat,
  highlight,
  location,
  replay,
  reply,
} from './encoder.js';

const examples = [
  heartbeat({
    maximumSchemaNumber: 3,
    version: '2.6.0-rc4',
    revision: '',
  }),

  highlight({
    callsign: 'WG6R',
    backgroundColor: {
      colorType: 1,
      alpha: 65535,
      red: 65535,
      green: 65535,
      blue: 65535,
      pad: 0,
    },
    foregroundColor: { colorType: 1, alpha: 65535, red: 0, green: 0, blue: 0, pad: 0 },
    highlightLast: true,
  }),

  replay({}),

  reply({
    time: 1664765550000 / 1000, // TODO something weird here
    snr: -14,
    deltaTime: 0.20000000298023224,
    deltaFrequency: 1444,
    mode: '~',
    message: 'CQ PJ4EL FK52',
    lowConfidence: 0,
    modifiers: 0,
  }),

  clear({ window: '' }),

  close({}),

  freeText({ text: 'TESTING', send: true }),

  haltTx({ autoTxOnly: true }),

  location({ location: 'DN78' }),
];

for (const example of examples) {
  const buffer = example.toBuffer(true);

  console.log(example);
  console.log(buffer);
  console.log(decode(buffer));

  console.log();
}

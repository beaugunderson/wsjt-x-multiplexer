/* eslint-disable max-classes-per-file, no-underscore-dangle */

import qtdatastream from 'qtdatastream';

const INT8 = 135;
const UINT8 = 136;

class QInt8 extends qtdatastream.types.QClass {
  static read(buffer) {
    return buffer.readInt8();
  }

  toBuffer() {
    const buf = Buffer.alloc(1);
    buf.writeInt8(this.__obj, 0);
    return buf;
  }
}

class QUInt8 extends qtdatastream.types.QClass {
  static read(buffer) {
    return buffer.readUInt8();
  }

  toBuffer() {
    const buf = Buffer.alloc(1);
    buf.writeUInt8(this.__obj, 0);
    return buf;
  }
}

qtdatastream.types.qtype(INT8)(QInt8);
qtdatastream.types.qtype(UINT8)(QUInt8);

qtdatastream.types.QUserType.register('UTF8', qtdatastream.types.Types.BYTEARRAY);

const COMMON_FIELDS = [
  { magic: qtdatastream.types.Types.UINT },
  { schema: qtdatastream.types.Types.UINT },
  { type: qtdatastream.types.Types.UINT },
  { id: 'UTF8' },
];

qtdatastream.types.QUserType.register('Heartbeat', [
  ...COMMON_FIELDS,
  { maximumSchemaNumber: qtdatastream.types.Types.UINT },
  { version: 'UTF8' },
  { revision: 'UTF8' },
]);

qtdatastream.types.QUserType.register('FreeText', [
  ...COMMON_FIELDS,
  { text: 'UTF8' },
  { send: qtdatastream.types.Types.BOOL },
]);

qtdatastream.types.QUserType.register('HaltTx', [
  ...COMMON_FIELDS,
  { autoTxOnly: qtdatastream.types.Types.BOOL },
]);

qtdatastream.types.QUserType.register('Clear', [...COMMON_FIELDS, { window: UINT8 }]);

qtdatastream.types.QUserType.register('Location', [...COMMON_FIELDS, { location: 'UTF8' }]);

qtdatastream.types.QUserType.register('Replay', [...COMMON_FIELDS]);

qtdatastream.types.QUserType.register('Close', [...COMMON_FIELDS]);

qtdatastream.types.QUserType.register('Reply', [
  ...COMMON_FIELDS,
  { time: qtdatastream.types.Types.TIME },
  { snr: qtdatastream.types.Types.INT },
  { deltaTime: qtdatastream.types.Types.DOUBLE },
  { deltaFrequency: qtdatastream.types.Types.INT },
  { mode: 'UTF8' },
  { message: 'UTF8' },
  { lowConfidence: qtdatastream.types.Types.BOOL },
  { modifiers: qtdatastream.types.Types.SHORT },
]);

qtdatastream.types.QUserType.register('Color', [
  { colorType: INT8 },
  { alpha: qtdatastream.types.Types.SHORT },
  { red: qtdatastream.types.Types.SHORT },
  { green: qtdatastream.types.Types.SHORT },
  { blue: qtdatastream.types.Types.SHORT },
  { pad: qtdatastream.types.Types.SHORT },
]);

qtdatastream.types.QUserType.register('Highlight', [
  ...COMMON_FIELDS,
  { callsign: 'UTF8' },
  { backgroundColor: 'Color' },
  { foregroundColor: 'Color' },
  { highlightLast: qtdatastream.types.Types.BOOL },
]);

const COMMON_VALUES = {
  magic: 0xadbccbda,
  schema: 3,
  id: 'WSJT-X',
};

function makeFunction(name, type) {
  return function write(obj) {
    return new qtdatastream.types.QUserType(name, {
      type,
      ...COMMON_VALUES,
      ...obj,
    });
  };
}

export const clear = makeFunction('Clear', 3);
export const close = makeFunction('Close', 6);
export const freeText = makeFunction('FreeText', 9);
export const haltTx = makeFunction('HaltTx', 8);
export const heartbeat = makeFunction('Heartbeat', 0);
export const highlight = makeFunction('Highlight', 13);
export const location = makeFunction('Location', 11);
export const replay = makeFunction('Replay', 7);
export const reply = makeFunction('Reply', 4);

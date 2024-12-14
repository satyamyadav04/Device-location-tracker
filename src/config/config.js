const config = {
  port: process.env.PORT || 3000,
  socketEvents: {
    connection: 'connection',
    deviceConnected: 'deviceConnected',
    locationUpdate: 'locationUpdate',
    disconnect: 'disconnect',
    pairRequest: 'pairRequest',
    pairAccept: 'pairAccept',
    locationShared: 'locationShared'
  }
};

module.exports = config;
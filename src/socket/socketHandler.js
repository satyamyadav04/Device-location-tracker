const events = require('./events');
const DeviceManager = require('../services/DeviceManager');
const { validateLocation } = require('../utils/locationUtils');

function setupSocket(io) {
  io.on(events.CONNECT, (socket) => {
    console.log('New connection:', socket.id);

    socket.on(events.DEVICE_CONNECTED, (deviceId) => {
      DeviceManager.addDevice(socket.id, deviceId);
      console.log(`Device ${deviceId} registered`);
    });

    socket.on(events.CONNECTION_REQUEST, (targetDeviceId) => {
      const targetDevice = DeviceManager.getDeviceByDeviceId(targetDeviceId);
      if (targetDevice) {
        const [targetSocketId, device] = targetDevice;
        const requestingDevice = DeviceManager.getDeviceBySocketId(socket.id);
        
        io.to(targetSocketId).emit(events.CONNECTION_REQUEST, {
          deviceId: requestingDevice.deviceId,
          socketId: socket.id
        });
      }
    });

    socket.on(events.CONNECTION_RESPONSE, ({ targetSocketId, accepted }) => {
      if (accepted) {
        DeviceManager.connectDevices(socket.id, targetSocketId);
        io.to(targetSocketId).emit(events.CONNECTION_RESPONSE, { accepted: true });
        socket.emit(events.CONNECTION_RESPONSE, { accepted: true });
      }
    });

    socket.on(events.LOCATION_UPDATE, (location) => {
      if (validateLocation(location)) {
        const connectedSocketId = DeviceManager.updateLocation(socket.id, location);
        if (connectedSocketId) {
          const device = DeviceManager.getDeviceBySocketId(socket.id);
          io.to(connectedSocketId).emit(events.LOCATION_SHARED, {
            deviceId: device.deviceId,
            location
          });
        }
      }
    });

    socket.on(events.DISCONNECT, () => {
      DeviceManager.removeDevice(socket.id);
      console.log('Device disconnected:', socket.id);
    });
  });
}

module.exports = setupSocket;
class DeviceManager {
  constructor() {
    this.devices = new Map();
    this.connections = new Map();
  }

  addDevice(socketId, deviceId) {
    this.devices.set(socketId, {
      deviceId,
      location: null,
      connectedTo: null
    });
  }

  removeDevice(socketId) {
    const device = this.devices.get(socketId);
    if (device && device.connectedTo) {
      const connectedDevice = this.getDeviceBySocketId(device.connectedTo);
      if (connectedDevice) {
        connectedDevice.connectedTo = null;
      }
    }
    this.devices.delete(socketId);
  }

  updateLocation(socketId, location) {
    const device = this.devices.get(socketId);
    if (device) {
      device.location = location;
      return device.connectedTo;
    }
    return null;
  }

  connectDevices(socketId1, socketId2) {
    const device1 = this.devices.get(socketId1);
    const device2 = this.devices.get(socketId2);
    
    if (device1 && device2) {
      device1.connectedTo = socketId2;
      device2.connectedTo = socketId1;
      return true;
    }
    return false;
  }

  getDeviceBySocketId(socketId) {
    return this.devices.get(socketId);
  }

  getDeviceByDeviceId(deviceId) {
    return Array.from(this.devices.entries())
      .find(([_, device]) => device.deviceId === deviceId);
  }
}

module.exports = new DeviceManager();
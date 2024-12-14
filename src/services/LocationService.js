class LocationService {
  constructor() {
    this.connectedDevices = new Map();
    this.pairedDevices = new Map();
  }

  addDevice(socketId, deviceId) {
    this.connectedDevices.set(socketId, { deviceId, location: null });
  }

  updateLocation(socketId, location) {
    const device = this.connectedDevices.get(socketId);
    if (device) {
      device.location = location;
      this.connectedDevices.set(socketId, device);
      
      // Share location with paired device
      const pairedSocketId = this.getPairedDevice(socketId);
      if (pairedSocketId) {
        return {
          pairedSocketId,
          location,
          deviceId: device.deviceId
        };
      }
    }
    return null;
  }

  pairDevices(socketId1, socketId2) {
    this.pairedDevices.set(socketId1, socketId2);
    this.pairedDevices.set(socketId2, socketId1);
  }

  getPairedDevice(socketId) {
    return this.pairedDevices.get(socketId);
  }

  removeDevice(socketId) {
    const pairedSocketId = this.getPairedDevice(socketId);
    if (pairedSocketId) {
      this.pairedDevices.delete(socketId);
      this.pairedDevices.delete(pairedSocketId);
    }
    this.connectedDevices.delete(socketId);
  }
}

module.exports = new LocationService();
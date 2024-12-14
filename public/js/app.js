import LocationService from './services/LocationService.js';
import MapService from './services/MapService.js';

class LocationTracker {
  constructor() {
    this.deviceId = this.generateDeviceId();
    this.socket = io();
    this.mapService = null;
    this.connectedDeviceId = null;
    this.isConnected = false;

    this.initialize();
  }

  generateDeviceId() {
    return 'Device_' + Math.random().toString(36).substr(2, 9);
  }

  async initialize() {
    try {
      const initialLocation = await LocationService.getCurrentPosition();
      this.mapService = new MapService('map', initialLocation);
      
      this.setupSocketListeners();
      this.setupUIListeners();
      this.socket.emit('deviceConnected', this.deviceId);
      
      document.getElementById('deviceId').textContent = this.deviceId;
      this.startLocationTracking();
    } catch (error) {
      this.showError('Error initializing: ' + error.message);
    }
  }

  setupSocketListeners() {
    this.socket.on('connectionRequest', ({ deviceId, socketId }) => {
      if (confirm(`Accept connection request from ${deviceId}?`)) {
        this.socket.emit('connectionResponse', { targetSocketId: socketId, accepted: true });
        this.connectedDeviceId = deviceId;
        this.isConnected = true;
        this.updateStatus(`Connected to ${deviceId}`);
      }
    });

    this.socket.on('connectionResponse', ({ accepted }) => {
      if (accepted) {
        this.isConnected = true;
        this.updateStatus('Connection established!');
      }
    });

    this.socket.on('locationShared', ({ deviceId, location }) => {
      this.mapService.updateMarker(deviceId, location, {
        popup: `${deviceId}'s location`,
        center: false
      });
      this.mapService.fitBounds();
    });

    this.socket.on('deviceDisconnected', (deviceId) => {
      if (deviceId === this.connectedDeviceId) {
        this.isConnected = false;
        this.connectedDeviceId = null;
        this.updateStatus('Device disconnected');
        this.mapService.removeMarker(deviceId);
      }
    });
  }

  setupUIListeners() {
    document.getElementById('connectForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const targetDeviceId = document.getElementById('targetDeviceId').value;
      this.socket.emit('connectionRequest', targetDeviceId);
      this.connectedDeviceId = targetDeviceId;
      this.updateStatus('Connection request sent...');
    });
  }

  startLocationTracking() {
    LocationService.startTracking(
      (location) => {
        this.mapService.updateMarker('You', location, {
          popup: 'Your location',
          center: true,
          zoom: 15
        });
        
        if (this.isConnected) {
          this.socket.emit('locationUpdate', location);
        }
      },
      (error) => this.showError('Location error: ' + error.message)
    );
  }

  updateStatus(message) {
    document.getElementById('status').textContent = message;
  }

  showError(message) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.style.color = 'red';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LocationTracker();
});
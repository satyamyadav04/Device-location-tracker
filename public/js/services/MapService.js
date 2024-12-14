export default class MapService {
  constructor(mapId, initialLocation = { lat: 0, lng: 0 }) {
    this.map = L.map(mapId).setView([initialLocation.lat, initialLocation.lng], 2);
    this.markers = new Map();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  updateMarker(id, location, options = {}) {
    const marker = this.markers.get(id);
    const position = [location.lat, location.lng];

    if (marker) {
      marker.setLatLng(position);
    } else {
      const newMarker = L.marker(position, options)
        .bindPopup(options.popup || id)
        .addTo(this.map);
      this.markers.set(id, newMarker);
    }

    if (options.center) {
      this.map.setView(position, options.zoom || this.map.getZoom());
    }
  }

  removeMarker(id) {
    const marker = this.markers.get(id);
    if (marker) {
      marker.remove();
      this.markers.delete(id);
    }
  }

  fitBounds() {
    if (this.markers.size > 0) {
      const bounds = L.latLngBounds(
        Array.from(this.markers.values()).map(marker => marker.getLatLng())
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }
}
function validateLocation(location) {
  return (
    location &&
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    location.lat >= -90 && location.lat <= 90 &&
    location.lng >= -180 && location.lng <= 180
  );
}

module.exports = {
  validateLocation
};
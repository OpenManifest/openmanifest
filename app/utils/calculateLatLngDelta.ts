function degreesToRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}
export function calculateLatLngDelta(latitude: number, mileRadius = 1) {
  const milePerDegreeAtEquator = 69.172;
  const milePerDegreeAtLatitude = Math.cos(degreesToRadians(latitude)) * milePerDegreeAtEquator;

  // We want 2 miles either direction,
  return mileRadius / milePerDegreeAtLatitude;
}

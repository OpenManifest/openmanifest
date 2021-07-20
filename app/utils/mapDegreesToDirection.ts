

const DEGREE_DIRECTION_SECTORS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"];
export function mapDegreesToDirections(degrees: number) {
  return DEGREE_DIRECTION_SECTORS[Math.round(degrees / 22.5)];
}
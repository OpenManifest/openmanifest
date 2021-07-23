interface ICoordinates {
  x: number;
  y: number;
}

export function calculateAngle180({ x: cx, y: cy }: ICoordinates, { x: ex, y: ey }: ICoordinates) {
  const dy = ey - cy;
  const dx = ex - cx;
  let theta = Math.atan2(dy, dx); // range (-PI, PI]
  theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
  return theta;
}

export function calculateAngle({ x: cx, y: cy }: ICoordinates, { x: ex, y: ey }: ICoordinates) {
  let theta = calculateAngle180({ x: cx, y: cy }, { x: ex, y: ey }); // range (-180, 180]
  if (theta < 0) theta = 360 + theta; // range [0, 360)
  return theta;
}

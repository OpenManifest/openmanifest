export function getPointOnCircle(opts: {
  x: number;
  y: number;
  degrees: number;
  radius: number;
  offsetX: number;
  offsetY: number;
}) {
  const { x, y, degrees, radius, offsetX, offsetY } = opts;
  return {
    x: x + radius + offsetX + radius * Math.sin(((degrees + (180 % 360)) * Math.PI) / 180),
    y: y + radius + offsetY + radius * -Math.cos(((degrees + (180 % 360)) * Math.PI) / 180),
  };
}

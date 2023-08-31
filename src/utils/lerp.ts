export default function lerp(min: number, max: number, factor: number) {
  const diff = max - min;
  return diff * factor + min;
}

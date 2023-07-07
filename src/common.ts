const coldHue = 220;
const hotHue = -5;
export const coldTemp = 10;
export const hotTemp = 36;

export const tempHsl = (temp = 24): string => {
  const hue = temp <= coldTemp ? coldHue :
    temp >= hotTemp ? hotHue :
    coldHue - Math.round(((temp - coldTemp) / (hotTemp - coldTemp)) * (coldHue - hotHue));
  return `hsl(${hue},70%,60%)`;
};

export function getShoeColorTheme(shoeColor) {
  if (!shoeColor) return { bg: "#4B5563", border: "#6B7280", shadow: "#4B556340" };

  const color = shoeColor.toLowerCase().trim();

  const colorMap = {
    red:    { bg: "#7F1D1D", border: "#991B1B", shadow: "#7F1D1D40" },
    blue:   { bg: "#1E3A8A", border: "#1D4ED8", shadow: "#1E3A8A40" },
    green:  { bg: "#065F46", border: "#047857", shadow: "#065F4640" },
    yellow: { bg: "#78350F", border: "#B45309", shadow: "#78350F40" },
    white:  { bg: "#6B7280", border: "#9CA3AF", shadow: "#6B728040" },
    gray:   { bg: "#4B5563", border: "#6B7280", shadow: "#4B556340" },
    black:  { bg: "#1F2937", border: "#374151", shadow: "#1F293740" },
    purple: { bg: "#5B21B6", border: "#6D28D9", shadow: "#5B21B640" },
  };

  if (colorMap[color]) return colorMap[color];

  for (const [key, value] of Object.entries(colorMap)) {
    if (color.includes(key)) return value;
  }

  return colorMap.gray;
}

export function getLifeRemainingColor(percentage) {
  if (percentage >= 50) {
    const ratio = (percentage - 50) / 50;
    const r = Math.round(46 + (241 - 46) * ratio);
    const g = Math.round(204 + (196 - 204) * ratio);
    const b = Math.round(113 + (15 - 113) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    const ratio = percentage / 50;
    const r = Math.round(231 + (241 - 231) * ratio);
    const g = Math.round(76 + (196 - 76) * ratio);
    const b = Math.round(60 + (15 - 60) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

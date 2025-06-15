export function getDaysInMonth(year, month) {
  const adjustedMonth = Math.max(0, Math.min(month - 1, 11));
  return new Date(year, adjustedMonth + 1, 0).getDate();
}

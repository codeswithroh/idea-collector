export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getEventColor(event: string): string {
  const colors = [
    "bg-brutal-yellow",
    "bg-brutal-pink",
    "bg-brutal-blue",
    "bg-white",
  ];
  let hash = 0;
  for (let i = 0; i < event.length; i++) {
    hash = event.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

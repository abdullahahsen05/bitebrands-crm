export function timeAgo(value: string) {
  const timestamp = new Date(value).getTime();
  const diffDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "vandaag";
  }
  if (diffDays === 1) {
    return "gisteren";
  }
  if (diffDays < 7) {
    return `${diffDays} dagen geleden`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} wk geleden`;
  }
  return `${Math.floor(diffDays / 30)} mnd geleden`;
}

export function clockAgo(value: string) {
  const timestamp = new Date(value).getTime();
  const diffMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));

  if (diffMinutes < 1) {
    return "net";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min`;
  }
  if (diffMinutes < 1440) {
    return `${Math.floor(diffMinutes / 60)} uur`;
  }
  return `${Math.floor(diffMinutes / 1440)} d`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");
}

const PATTERNS = [
  /youtube\.com\/watch\?v=([^&]+)/,
  /youtu\.be\/([^?]+)/,
  /youtube\.com\/embed\/([^?]+)/,
];

export function getYouTubeId(url: string): string | null {
  for (const p of PATTERNS) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function getEmbedUrl(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1` : null;
}

export function getThumbnail(url: string): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

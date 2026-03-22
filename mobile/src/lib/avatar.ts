export function initialsFromValue(value: string | null | undefined, fallback = '?') {
  const normalized = (value || '').trim();
  if (!normalized) {
    return fallback;
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
}

function hashSeed(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 360;
  }
  return hash;
}

export function avatarStyle(seed: string | null | undefined) {
  const hue = hashSeed((seed || 'wallet').trim().toLowerCase() || 'wallet');
  return {
    backgroundColor: `hsl(${hue} 78% 92%)`,
    borderColor: `hsl(${hue} 58% 80%)`,
    color: `hsl(${hue} 42% 30%)`
  };
}

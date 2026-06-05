/**
 * Stable device fingerprint — generated once, stored in localStorage.
 * Combines browser properties that are constant across tabs/sessions
 * but differ between devices and browsers.
 */

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function collectTraits() {
  const nav = window.navigator;
  const screen = window.screen;
  const traits = [
    nav.userAgent        || '',
    nav.language         || '',
    nav.platform         || '',
    nav.hardwareConcurrency || '',
    nav.deviceMemory     || '',
    screen.width         || '',
    screen.height        || '',
    screen.colorDepth    || '',
    screen.pixelDepth    || '',
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    typeof window.indexedDB !== 'undefined' ? '1' : '0',
    typeof window.openDatabase !== 'undefined' ? '1' : '0',
  ].join('|');
  return traits;
}

const STORAGE_KEY = 'forge_device_fp';

export function getDeviceFingerprint() {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;

    const traits = collectTraits();
    const fp = djb2(traits) + '-' + djb2(traits.split('').reverse().join(''));
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    // localStorage blocked (private mode, etc.) — generate ephemeral ID
    return djb2(collectTraits());
  }
}

// Utilidades de compresión para mensajes WebSocket grandes.
// Estrategia: si el JSON serializado supera 5MB, se comprime con gzip y se envía
// dentro de un wrapper { type: '__compressed__', encoding: 'gzip+base64', ... }.
// En la recepción se detecta y se restaura el objeto original transparente.

import { gzip, ungzip } from 'pako';
/* global btoa, atob */

// Polyfills btoa/atob para entorno de build (Node) si no existen
const _btoa = (str) => {
  try { if (typeof btoa === 'function') return btoa(str); } catch {}
  try { if (typeof globalThis !== 'undefined' && globalThis.Buffer) return globalThis.Buffer.from(str, 'binary').toString('base64'); } catch {}
  // Fallback lento
  let output = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let i = 0;
  while (i < str.length) {
    const c1 = str.charCodeAt(i++);
    const c2 = str.charCodeAt(i++);
    const c3 = str.charCodeAt(i++);
    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    let e3 = ((c2 & 15) << 2) | (c3 >> 6);
    let e4 = c3 & 63;
    if (isNaN(c2)) { e3 = 64; e4 = 64; }
    else if (isNaN(c3)) { e4 = 64; }
    output += chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }
  return output;
};
const _atob = (b64) => {
  try { if (typeof atob === 'function') return atob(b64); } catch {}
  try { if (typeof globalThis !== 'undefined' && globalThis.Buffer) return globalThis.Buffer.from(b64, 'base64').toString('binary'); } catch {}
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = '';
  let i = 0;
  b64 = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  while (i < b64.length) {
    const e1 = chars.indexOf(b64.charAt(i++));
    const e2 = chars.indexOf(b64.charAt(i++));
    const e3 = chars.indexOf(b64.charAt(i++));
    const e4 = chars.indexOf(b64.charAt(i++));
    const c1 = (e1 << 2) | (e2 >> 4);
    const c2 = ((e2 & 15) << 4) | (e3 >> 2);
    const c3 = ((e3 & 3) << 6) | e4;
    str += String.fromCharCode(c1);
    if (e3 !== 64 && e3 !== -1) str += String.fromCharCode(c2);
    if (e4 !== 64 && e4 !== -1) str += String.fromCharCode(c3);
  }
  return str;
};

const THRESHOLD = 5 * 1024 * 1024; 
function bytesToBase64(bytes) {
  if (!(bytes instanceof Uint8Array)) bytes = new Uint8Array(bytes);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    const sub = bytes.subarray(i, i + chunk);
    binary += String.fromCharCode.apply(null, sub);
  }
  return _btoa(binary);
}

function base64ToBytes(b64) {
  const binary = _atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export function maybeCompressMessage(obj) {
  try {
    if (!obj || typeof obj !== 'object') return { wrapper: null, json: JSON.stringify(obj || {}) };
    if (obj.type === '__compressed__') {
      // Evitar doble compresión accidental
      return { wrapper: null, json: JSON.stringify(obj) };
    }
    const json = JSON.stringify(obj);
    if (json.length < THRESHOLD) {
      return { wrapper: null, json };
    }
    // Comprimir
    const gz = gzip(json);
    const b64 = bytesToBase64(gz);
    const wrapper = {
      type: '__compressed__',
      encoding: 'gzip+base64',
      originalType: obj.type,
      originalLength: json.length,
      compressedLength: b64.length,
      payload: b64
    };
    return { wrapper, json: JSON.stringify(wrapper) };
  } catch (e) {
    // Fallback a plano
    try { return { wrapper: null, json: JSON.stringify(obj) }; } catch { return { wrapper: null, json: '{}' }; }
  }
}

export function tryDecompressWrapper(obj) {
  try {
    if (!obj || obj.type !== '__compressed__' || obj.encoding !== 'gzip+base64') return obj;
    const b64 = obj.payload;
    if (typeof b64 !== 'string' || !b64) return obj;
    const bytes = base64ToBytes(b64);
    const jsonBytes = ungzip(bytes, { to: 'string' });
    const parsed = JSON.parse(jsonBytes);
    return parsed;
  } catch (e) {
    // Si falla, devolver original para no romper flujo
    return obj;
  }
}

export const COMPRESSION_THRESHOLD = THRESHOLD;

import { fetchWithTimeout } from "./http.js";
import { log } from "./logger.js";
import { safeParseResponse } from './json.js';

const BASE = "https://bplace.org";

export async function getSession() {
  try {
    const me = await fetch(`${BASE}/me`, { credentials: 'include' }).then(r => r.json());
    const user = me || null;
    const c = me?.charges || {};
    const droplets = me?.droplets ?? 0;
    const charges = {
      count: c.count ?? 0,
      max: c.max ?? 0,
      cooldownMs: c.cooldownMs ?? 30000
    };
    
    return { 
      success: true,
      data: {
        user, 
        charges: charges.count,
        maxCharges: charges.max,
        chargeRegen: charges.cooldownMs,
        droplets
      }
    };
  } catch (error) { 
    return { 
      success: false,
      error: error.message,
      data: {
        user: null, 
        charges: 0,
        maxCharges: 0,
        chargeRegen: 30000,
        droplets: 0
      }
    }; 
  }
}

export async function checkHealth() {
  try {
    const response = await fetch(`${BASE}/health`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const health = await response.json();
      return {
        ...health,
        lastCheck: Date.now(),
        status: 'online'
      };
    } else {
      return {
        database: false,
        up: false,
        uptime: 'N/A',
        lastCheck: Date.now(),
        status: 'error',
        statusCode: response.status
      };
    }
  } catch (error) {
    return {
      database: false,
      up: false,
      uptime: 'N/A',
      lastCheck: Date.now(),
      status: 'offline',
      error: error.message
    };
  }
}

// Compra de producto (ej. aumentar cargas máximas en +5)
export async function purchaseProduct(productId = 70, amount = 1) {
  try {
    const body = JSON.stringify({ product: { id: productId, amount } });
    const r = await fetchWithTimeout(`${BASE}/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
      credentials: 'include',
      timeout: 15000
    });
    let json = {};
    try { json = await r.json(); } catch { json = {}; }
    return { success: r.ok, status: r.status, json };
  } catch (error) {
    return { success: false, status: 0, json: { error: error.message } };
  }
}

// Post píxel para farm - versión simplificada para bPlace
export async function postPixel(coords, colors, turnstileToken, tileX, tileY) {
  try {
    // Normalizar formatos de entrada
    const normalizeCoords = (arr) => {
      if (!Array.isArray(arr)) return [];
      const flat = [];
      // Caso 1: array plano de números
      if (arr.length > 0 && typeof arr[0] === 'number') {
        for (let i = 0; i < arr.length; i += 2) {
          const x = Math.trunc(arr[i]);
          const y = Math.trunc(arr[i + 1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      // Caso 2: array de objetos {x,y}
      if (typeof arr[0] === 'object' && arr[0] && ('x' in arr[0] || 'y' in arr[0])) {
        for (const p of arr) {
          const x = Math.trunc(p?.x);
          const y = Math.trunc(p?.y);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      // Caso 3: array de arrays [x,y]
      if (Array.isArray(arr[0])) {
        for (const p of arr) {
          const x = Math.trunc(p?.[0]);
          const y = Math.trunc(p?.[1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      return flat;
    };
    const normalizeColors = (cols) => Array.isArray(cols) ? cols.map(c => Math.trunc(Number(c)) || 0) : [];

    const coordsNorm = normalizeCoords(coords);
    const colorsNorm = normalizeColors(colors);
    if (coordsNorm.length === 0 || colorsNorm.length === 0 || (coordsNorm.length / 2) !== colorsNorm.length) {
      return { status: 400, json: { error: 'Invalid coords/colors format' }, success: false };
    }
    
    const body = JSON.stringify({ colors: colorsNorm, coords: coordsNorm, t: "skip" });
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(`${BASE}/s0/pixel/${tileX}/${tileY}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // bPlace: manejo simplificado de errores
    if (response.status === 403) {
      try { await response.json(); } catch { /* Ignore JSON parsing errors */ }
      console.error("❌ 403 Forbidden. Posible problema de sesión o permisos.");
      return {
        status: 403,
        json: { error: 'Forbidden - check session' },
        success: false
      };
    }

    // Para errores 5xx, simplemente devolver el error
    if (response.status >= 500 && response.status <= 504) {
      console.error(`❌ Server error ${response.status}`);
    }

    const parsed = await safeParseResponse(response);
    return { status: response.status, json: parsed.json, success: response.ok };
  } catch (error) {
    // Manejo específico para timeouts y abort errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return {
        status: 408,
        json: { error: 'Request timeout' },
        success: false
      };
    }
    return {
      status: 0,
      json: { error: error.message },
      success: false
    };
  }
}

// Post píxel para Auto-Image - versión simplificada para bPlace
export async function postPixelBatchImage(tileX, tileY, coords, colors, turnstileToken) {
  try {
    // Normalizar coords/colors al formato exacto que espera el backend
    const normalizeCoords = (arr) => {
      if (!Array.isArray(arr)) return [];
      const flat = [];
      if (arr.length > 0 && typeof arr[0] === 'number') {
        for (let i = 0; i < arr.length; i += 2) {
          const x = Math.trunc(arr[i]);
          const y = Math.trunc(arr[i + 1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      if (typeof arr[0] === 'object' && arr[0] && ('x' in arr[0] || 'y' in arr[0])) {
        for (const p of arr) {
          const x = Math.trunc(p?.x);
          const y = Math.trunc(p?.y);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      if (Array.isArray(arr[0])) {
        for (const p of arr) {
          const x = Math.trunc(p?.[0]);
          const y = Math.trunc(p?.[1]);
          if (Number.isFinite(x) && Number.isFinite(y)) {
            flat.push(((x % 1000) + 1000) % 1000, ((y % 1000) + 1000) % 1000);
          }
        }
        return flat;
      }
      return flat;
    };
    const normalizeColors = (cols) => Array.isArray(cols) ? cols.map(c => Math.trunc(Number(c)) || 0) : [];

    const coordsNorm = normalizeCoords(coords);
    const colorsNorm = normalizeColors(colors);
    if (coordsNorm.length === 0 || colorsNorm.length === 0 || (coordsNorm.length / 2) !== colorsNorm.length) {
      log(`[API] Invalid coords/colors for tile ${tileX},${tileY} → coordsPairs=${coordsNorm.length/2} colors=${colorsNorm.length}`);
      return { status: 400, json: { error: 'Invalid coords/colors format' }, success: false, painted: 0 };
    }
    
    const body = JSON.stringify({ 
      colors: colorsNorm, 
      coords: coordsNorm, 
      t: "skip"
    });
    
    log(`[API] Sending batch to tile ${tileX},${tileY} with ${colors.length} pixels (bPlace mode: no tokens)`);
    
    const response = await fetch(`${BASE}/s0/pixel/${tileX}/${tileY}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: body
    });

    log(`[API] Response: ${response.status} ${response.statusText}`);

    // Manejo de errores simplificado
    if (response.status === 403) {
      try { await response.json(); } catch { /* Ignore JSON parsing errors */ }
      console.error("❌ 403 Forbidden. Verifica tu sesión.");
      return {
        status: 403,
        json: { error: 'Forbidden - check session' },
        success: false,
        painted: 0
      };
    }

    if (response.status >= 500 && response.status <= 504) {
      log(`[API] Server error: ${response.status}`);
    }

    const finalParsed = await safeParseResponse(response);
    const painted = finalParsed.json?.painted || 0;
    log(`[API] Result: ${painted} pixels painted`);

    return {
      status: response.status,
      json: finalParsed.json,
      success: response.ok,
      painted: painted
    };
  } catch (error) {
    // Manejo específico para timeouts y abort errors
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      log(`[API] Request timeout for tile ${tileX},${tileY}`);
      return {
        status: 408,
        json: { error: 'Request timeout' },
        success: false,
        painted: 0
      };
    }
    log(`[API] Network error: ${error.message}`);
    return {
      status: 0,
      json: { error: error.message },
      success: false,
      painted: 0
    };
  }
}

// Descarga y evalúa el bot seleccionado (compartido para otros lanzadores si aplica)
export async function downloadAndExecuteBot(botType, rawBase) {
  log(`📥 Descargando bot: ${botType}`);
  try {
    const botFiles = {
      'farm': 'Auto-Farm.js',
      'image': 'Auto-Image.js',
      'guard': 'Auto-Guard.js'
    };

    const fileName = botFiles[botType];
    if (!fileName) throw new Error(`Tipo de bot desconocido: ${botType}`);

    const url = `${rawBase}/${fileName}`;
    log(`🌐 URL: ${url}`);

    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const code = await response.text();
    log(`✅ Bot descargado (${code.length} chars), inyectando...`);

    const sourceURL = `\n//# sourceURL=${url}`;
    
    // Ejecutar en contexto global
    log('🚀 Ejecutando bot en contexto global...');
    (0, eval)(code + sourceURL);
    log('✅ Bot ejecutado correctamente');
    return true;
  } catch (error) {
    log('❌ Error descargando/ejecutando bot:', error.message);
    throw error;
  }
}

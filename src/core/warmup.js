import { log } from "./logger.js";
import { getFingerprint } from "./turnstile.js";
import { ensureFingerprint } from './fingerprint.js';
// bPlace: No usa pawtect ni turnstile, solo autenticación por cookie

/**
 * Función principal para preparar tokens antes de iniciar un bot
 * En bPlace esto es simplificado: solo usa cookies de sesión
 * @param {string} botName - Nombre del bot que se está iniciando
 * @returns {Promise<Object>} - Resultado de la preparación
 */
export async function prepareTokensForBot(botName = "Bot") {
  log(`🚀 [${botName}] Preparando bot para bPlace (autenticación por cookie)`);
  // Solo asegurar fingerprint por compatibilidad
  try { ensureFingerprint({}); } catch {}
  // bPlace no requiere tokens adicionales
  return { success: true, fingerprint: getFingerprint(), pawtectToken: null, skipped: true };
}

/**
 * Función de compatibilidad - reemplaza warmUpForTokens
 * @deprecated Usar prepareTokensForBot en su lugar
 */
export async function warmUpForTokens(context = "bot") {
  log(`⚠️ warmUpForTokens está deprecado, usar prepareTokensForBot`);
  const result = await prepareTokensForBot(context);
  return result.success;
}

/**
 * Función de compatibilidad - verifica si ya tenemos fingerprint
 * @deprecated El nuevo sistema maneja esto automáticamente
 */
export async function ensureFingerprintReady(context = "bot", options = {}) {
  log(`⚠️ ensureFingerprintReady está deprecado, usar prepareTokensForBot`);
  
  // Fast-path si ya existe
  const fp = getFingerprint();
  if (fp) {
    log(`🆔 [fp:${context}] Ya disponible`);
    return true;
  }
  
  // Usar el nuevo sistema
  const result = await prepareTokensForBot(context);
  return result.success && result.fingerprint;
}

/**
 * Verifica si tenemos tokens disponibles sin mostrar UI
 * En bPlace solo verifica fingerprint y sesión
 * @returns {Object} - Estado de los tokens
 */
export function checkTokensAvailable() {
  const fingerprint = getFingerprint();
  return {
    hasFingerprint: !!fingerprint,
    hasPawtectToken: false, // bPlace no usa pawtect
    interceptorReady: true,
    allReady: !!fingerprint // En bPlace solo necesitamos fingerprint
  };
}

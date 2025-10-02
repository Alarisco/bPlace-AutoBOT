// bPlace stub - pawtect no se usa en bPlace, solo autenticación por cookie
import { log } from "./logger.js";

/**
 * Dummy stub para compatibilidad con imports existentes
 * bPlace no requiere tokens pawtect, solo usa cookies de sesión
 */

export function seedPawtect() {
  // No-op: bPlace no usa pawtect
  log('[pawtect-stub] bPlace no requiere tokens pawtect');
}

export async function computePawtect() {
  // No-op: retornar null ya que bPlace no usa pawtect
  return null;
}

export function getPawtectToken() {
  // No-op: retornar null ya que bPlace no usa pawtect
  return null;
}

export async function waitForPawtect() {
  // No-op: retornar inmediatamente
  return;
}

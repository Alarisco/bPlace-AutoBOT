import { log } from "../core/logger.js";

const randInt = (n) => Math.floor(Math.random() * n);

export function randomCoordInTile(tileX, tileY, margin = 0.05) {
  const size = 3000;
  const m = Math.floor(size * margin);
  const rx = Math.floor(Math.random() * (size - 2*m)) + m;
  const ry = Math.floor(Math.random() * (size - 2*m)) + m;
  return { x: rx, y: ry, absX: tileX * size + rx, absY: tileY * size + ry };
}

// Farm-specific coordinate generation usando posición base y radio
export function randomCoords(cfg) {
  // Verificar si se ha seleccionado una posición base
  if (!cfg.POSITION_SELECTED || cfg.BASE_X === null || cfg.BASE_Y === null) {
    log('⚠️ No se ha seleccionado una posición base. Usando coordenadas aleatorias fallback.');
    // Fallback a coordenadas aleatorias en el tile (comportamiento anterior)
    const margin = Math.floor(cfg.TILE_SIZE * 0.05);
    const safeSize = cfg.TILE_SIZE - (margin * 2);
    
    if (safeSize <= 0) {
      return [Math.floor(Math.random() * cfg.TILE_SIZE), Math.floor(Math.random() * cfg.TILE_SIZE)];
    }
    
    const localX = margin + Math.floor(Math.random() * safeSize);
    const localY = margin + Math.floor(Math.random() * safeSize);
    return [localX, localY];
  }
  
  // ENFOQUE SIMPLIFICADO: Generar coordenadas directamente en el tile actual
  // para evitar problemas de conversión absoluta/local
  
  const radius = cfg.FARM_RADIUS;
  const maxSize = cfg.TILE_SIZE - 1; // 2999 para tile de 3000
  
  // Generar un ángulo aleatorio y una distancia aleatoria dentro del radio
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius;
  
  // Calcular offset desde la posición base (local)
  const offsetX = Math.round(distance * Math.cos(angle));
  const offsetY = Math.round(distance * Math.sin(angle));
  
  // Calcular coordenadas locales finales directamente
  let localX = cfg.BASE_X + offsetX;
  let localY = cfg.BASE_Y + offsetY;
  
  // Asegurar que las coordenadas están dentro del tile
  localX = Math.max(0, Math.min(maxSize, localX));
  localY = Math.max(0, Math.min(maxSize, localY));
  
  return [localX, localY];
}

// Generar múltiples coordenadas para línea recta
export function generateStraightLine(count, cfg) {
  const coords = [];
  const maxSize = cfg.TILE_SIZE - 1; // 2999 para tile de 3000
  
  // Punto de inicio: posición base seleccionada
  let currentX = Math.max(0, Math.min(maxSize, cfg.BASE_X));
  let currentY = Math.max(0, Math.min(maxSize, cfg.BASE_Y));
  
  // Generar línea horizontal (como el ejemplo del usuario: 622,635,623,635,624,635...)
  for (let i = 0; i < count; i++) {
    // Asegurar que las coordenadas están dentro del rango válido
    currentX = Math.max(0, Math.min(maxSize, currentX));
    currentY = Math.max(0, Math.min(maxSize, currentY));
    
    coords.push(currentX, currentY);
    
    // Avanzar hacia la derecha (línea horizontal)
    currentX++;
    
    // Si llegamos al borde derecho, pasar a la siguiente línea
    if (currentX > maxSize) {
      currentX = Math.max(0, Math.min(maxSize, cfg.BASE_X)); // Volver al inicio X
      currentY++; // Bajar una línea
      
      // Si llegamos al borde inferior, volver arriba
      if (currentY > maxSize) {
        currentY = Math.max(0, Math.min(maxSize, cfg.BASE_Y));
      }
    }
  }
  
  // Log para debugging - mostrar patrón de línea recta generado
  if (coords.length >= 4) {
    log(`🎯 Línea recta generada: [${coords.slice(0, 8).join(',')}...] total: ${coords.length/2} píxeles`);
  }
  
  return coords;
}

export function generateMultipleColors(count, cfg) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(nextColor(cfg));
  }
  return colors;
}

export function nextColor(cfg) {
  if (cfg.COLOR_MODE === 'fixed') {
    return cfg.COLOR_FIXED;
  } else {
    // Modo random: color entre COLOR_MIN y COLOR_MAX (inclusivo)
    const span = cfg.COLOR_MAX - cfg.COLOR_MIN + 1;
    return cfg.COLOR_MIN + randInt(span);
  }
}

export function nextColorLegacy(palette) {
  return palette[Math.floor(Math.random() * palette.length)];
}
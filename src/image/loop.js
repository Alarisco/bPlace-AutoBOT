import { postPixelBatch } from "../core/wplace-api.js";

export async function paintImageBatches({ batches }, onStatus) {
  const token = "skip";
  for (const b of batches) {
    await postPixelBatch({ tileX: b.tileX, tileY: b.tileY, pixels: b.pixels, turnstileToken: token });
    onStatus?.(`Tile ${b.tileX},${b.tileY} OK (${b.pixels.length} px)`);
  }
}

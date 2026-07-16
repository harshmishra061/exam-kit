/**
 * Draws the image as grayscale at the target size, then removes the paper
 * behind the signature: a blurred down/upscaled copy of the image is used
 * as a per-region "local background" estimate (so it adapts to uneven
 * lighting/shadows across a photographed sheet of paper, not just a single
 * global brightness), each pixel is corrected relative to that local
 * background, contrast is ramped up by intensity, and near-white pixels are
 * snapped to pure white. Everything after the initial grayscale filter runs
 * as one pixel pass, so it stays fast even while dragging the slider.
 */
export function renderSignatureCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  intensityPercent: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = "grayscale(1)";
  ctx.drawImage(img, 0, 0, width, height);
  ctx.filter = "none";

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const background = estimateLocalBackground(canvas, width, height);

  const clamped = Math.min(Math.max(intensityPercent, 0), 100);
  const shadingCorrection = clamped / 100;
  // Classic contrast formula: newValue = factor * (oldValue - 128) + 128.
  const C = (clamped / 100) * 254;
  const contrastFactor = (259 * (C + 255)) / (255 * (259 - C));

  for (let i = 0; i < data.length; i += 4) {
    const pixel = i / 4;
    const value = data[i];
    const localPaperBrightness = Math.max(background[pixel], 1);

    // Rescale so the local paper shade reads as white, regardless of
    // shadows/uneven lighting in that region of the photo.
    const shadingCorrected = clampByte(value * (250 / localPaperBrightness));
    const blended = value * (1 - shadingCorrection) + shadingCorrected * shadingCorrection;
    const contrasted = clampByte(contrastFactor * (blended - 128) + 128);

    data[i] = data[i + 1] = data[i + 2] = contrasted;
  }

  ctx.putImageData(imageData, 0, 0);
  snapNearWhiteToWhite(ctx, width, height);

  return canvas;
}

/**
 * Cheap blur via downscale-then-upscale (both GPU-accelerated canvas
 * operations, no manual convolution): shrinking the image averages out thin
 * ink strokes, leaving a low-resolution map of the paper's brightness per
 * region; scaling that back up gives a smooth per-pixel background estimate.
 */
function estimateLocalBackground(
  source: HTMLCanvasElement,
  width: number,
  height: number
): Uint8ClampedArray {
  const smallWidth = Math.max(6, Math.round(width / 10));
  const smallHeight = Math.max(6, Math.round(height / 10));

  const small = document.createElement("canvas");
  small.width = smallWidth;
  small.height = smallHeight;
  const smallCtx = small.getContext("2d");
  if (!smallCtx) throw new Error("Canvas 2D context unavailable");
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.imageSmoothingQuality = "high";
  smallCtx.drawImage(source, 0, 0, width, height, 0, 0, smallWidth, smallHeight);

  const blurred = document.createElement("canvas");
  blurred.width = width;
  blurred.height = height;
  const blurredCtx = blurred.getContext("2d");
  if (!blurredCtx) throw new Error("Canvas 2D context unavailable");
  blurredCtx.imageSmoothingEnabled = true;
  blurredCtx.imageSmoothingQuality = "high";
  blurredCtx.drawImage(small, 0, 0, smallWidth, smallHeight, 0, 0, width, height);

  const data = blurredCtx.getImageData(0, 0, width, height).data;
  const background = new Uint8ClampedArray(width * height);
  for (let pixel = 0; pixel < background.length; pixel++) {
    background[pixel] = data[pixel * 4];
  }
  return background;
}

function snapNearWhiteToWhite(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  whiteThreshold = 235
): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i] >= whiteThreshold) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, value));
}

export interface CompressResult {
  blob: Blob;
  quality: number;
  sizeKB: number;
  hitTarget: boolean;
}

/**
 * Binary-searches JPEG quality to land at or under targetKB.
 * If even the lowest quality is still over target, returns that
 * lowest-quality blob with hitTarget=false so the caller can warn the user.
 */
export async function compressToTargetKB(
  canvas: HTMLCanvasElement,
  targetKB: number,
  mimeType: "image/jpeg" | "image/png" = "image/jpeg"
): Promise<CompressResult> {
  const toBlob = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
        mimeType,
        quality
      );
    });

  if (mimeType === "image/png") {
    const blob = await toBlob(1);
    const sizeKB = blob.size / 1024;
    return { blob, quality: 1, sizeKB, hitTarget: sizeKB <= targetKB };
  }

  let lo = 0.01;
  let hi = 1;
  let best: { blob: Blob; quality: number } | null = null;

  for (let i = 0; i < 8; i++) {
    const mid = (lo + hi) / 2;
    const blob = await toBlob(mid);
    const sizeKB = blob.size / 1024;

    if (sizeKB <= targetKB) {
      best = { blob, quality: mid };
      lo = mid;
    } else {
      hi = mid;
    }
  }

  if (best) {
    return {
      blob: best.blob,
      quality: best.quality,
      sizeKB: best.blob.size / 1024,
      hitTarget: true,
    };
  }

  const fallback = await toBlob(0.01);
  return {
    blob: fallback,
    quality: 0.01,
    sizeKB: fallback.size / 1024,
    hitTarget: false,
  };
}

/** Draws the image resized to the given pixel dimensions on a fresh canvas. */
export function resizeToCanvas(
  img: CanvasImageSource,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/**
 * Draws the image at the given size, then overlays multiline text at the
 * bottom — a solid white band behind black text keeps it legible regardless
 * of what's in the photo, without extending the canvas.
 */
export function drawPhotoCaption(
  img: CanvasImageSource,
  width: number,
  height: number,
  text: string,
  fontSizePx: number
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  const lines = text.split("\n");
  if (lines.every((line) => line.trim() === "")) return canvas;

  const lineHeight = fontSizePx * 1.3;
  const paddingY = fontSizePx * 0.4;
  const bandHeight = Math.min(height, lines.length * lineHeight + paddingY * 2);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, height - bandHeight, width, bandHeight);

  ctx.fillStyle = "#000000";
  ctx.font = `600 ${fontSizePx}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lines.forEach((line, i) => {
    const y = height - bandHeight + paddingY + lineHeight * i + lineHeight / 2;
    ctx.fillText(line, width / 2, y);
  });

  return canvas;
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface LoadedImage {
  src: string;
  width: number;
  height: number;
  mime: string;
}

/** Reads a file as a data URL and its natural pixel dimensions. */
export function loadImageDataUrl(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({ src, width: img.naturalWidth, height: img.naturalHeight, mime: file.type });
      };
      img.onerror = reject;
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

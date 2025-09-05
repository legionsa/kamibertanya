/* -------------------------------------------
 * utilities.ts
 * - Random background from src/images
 * - Duotone overlay variables
 * - WCAG 2.1 contrast (4.5:1) + text color pick
 * - Theme change hookup (press 'T' to change theme)
 * - Export pipeline: WYSIWYG (html2canvas) + background composite
 * - Share/Copy/Download actions
 * ------------------------------------------ */

type Maybe<T> = T | null | undefined;

/** Gather all images under src/images with webpack require.context.
 *  If your bundler does not support this, the fallback below tries to guess by static import glob.
 */
let imageUrls: string[] = [];

function initImagePool() {
  try {
    // @ts-ignore - Webpack
    const ctx = require.context("./images", false, /\.(png|jpe?g|webp|avif|gif)$/i);
    imageUrls = ctx.keys().map((k: string) => ctx(k));
  } catch {
    // Vite fallback (needs vite-plugin-glob or import.meta.globEager in TS config)
    try {
      // @ts-ignore - Vite
      const modules = import.meta.glob("./images/*.{png,jpg,jpeg,webp,avif,gif}", {
        eager: true,
        as: "url",
      });
      imageUrls = Object.values(modules) as string[];
    } catch {
      // worst case: static defaults (edit as needed)
      imageUrls = [
        // e.g. "/src/images/bg1.jpg",
      ];
    }
  }
}

function randInt(max: number) {
  return Math.floor(Math.random() * max);
}

export function getRandomImageUrl(): Maybe<string> {
  if (!imageUrls.length) initImagePool();
  return imageUrls.length ? imageUrls[randInt(imageUrls.length)] : null;
}

/* ---------------------------
 * WCAG contrast helpers
 * -------------------------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function srgbToLin(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const R = srgbToLin(r);
  const G = srgbToLin(g);
  const B = srgbToLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(fg: string, bg: string) {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

/** Choose the most prominent/readable text color among candidates */
export function pickReadableTextColor(
  bgHex: string,
  candidates = ["#ffffff", "#000000", "#000072"]
) {
  let best = candidates[0];
  let bestRatio = 0;
  for (const c of candidates) {
    const ratio = contrastRatio(c, bgHex);
    if (ratio > bestRatio) {
      best = c;
      bestRatio = ratio;
    }
  }
  // Prefer one that passes 4.5:1 if possible
  const passing = candidates
    .map((c) => ({ c, r: contrastRatio(c, bgHex) }))
    .filter((x) => x.r >= 4.5)
    .sort((a, b) => b.r - a.r);
  return passing.length ? passing[0].c : best;
}

/* ---------------------------
 * CSS variable setters
 * -------------------------- */
function setCssVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

export function setRandomBackground(force = false) {
  const url = getRandomImageUrl();
  if (url || force) {
    setCssVar("--bg-image", url ? `url("${url}")` : "none");
  }
  // You can also randomize duotone slightly each change if desired:
  // jitterDuotone();
}

export function setThemeSurfaceColor(surfaceHex: string) {
  setCssVar("--surface", surfaceHex);
  const readable = pickReadableTextColor(surfaceHex);
  setCssVar("--theme-foreground", readable);
}

/* Optional: small hue jitter if you want subtle variety */
function jitterHex(hex: string, amt = 0) {
  if (!amt) return hex;
  const [r, g, b] = hexToRgb(hex);
  const j = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v + (Math.random() * 2 - 1) * amt)));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(j(r))}${toHex(j(g))}${toHex(j(b))}`;
}

export function jitterDuotone(amount = 0) {
  setCssVar("--duo-a", jitterHex("#f784c5", amount));
  setCssVar("--duo-b", jitterHex("#1b602f", amount));
  setCssVar("--accent", jitterHex("#000072", amount));
}

/* ---------------------------
 * THEME handling
 * -------------------------- */

/** Minimal theme manager:
 *  - Press 'T' to toggle surface between two examples
 *  - Dispatches 'theme-changed' so background randomizes each time
 *  If your app already has setTheme(), you can call setThemeSurfaceColor()
 *  inside it and dispatch the same event.
 */
export function installThemeToggler() {
  let dark = true;
  const apply = () => {
    const surface = dark ? "#0f0f11" : "#f6f7f8";
    setThemeSurfaceColor(surface);
    // Every theme change -> pick a new background
    setRandomBackground(true);
    document.dispatchEvent(new CustomEvent("theme-changed", { detail: { surface } }));
  };

  window.addEventListener("keydown", (ev) => {
    if (ev.key.toLowerCase() === "t") {
      dark = !dark;
      apply();
    }
  });

  // initial
  apply();
}

/* ---------------------------
 * EXPORT PIPELINE (WYSIWYG)
 * --------------------------
 * We composite:
 *  1) the same background + duotone as the page
 *  2) a raster of #capture-root via html2canvas
 */

function getNumberFromCssVar(name: string, fallback = 0.2): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const v = parseFloat(raw);
  return Number.isFinite(v) ? v : fallback;
}

function parseCssColor(hex: string): [number, number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [r, g, b, 255];
}

async function rasterNode(node: HTMLElement, scale = 2) {
  const html2canvas = (window as any).html2canvas as
    | ((
        el: HTMLElement,
        opts?: { backgroundColor?: string; scale?: number }
      ) => Promise<HTMLCanvasElement>)
    | undefined;

  if (!html2canvas) {
    throw new Error("html2canvas belum tersedia.");
  }

  return await html2canvas(node, {
    backgroundColor: null, // keep transparency; we composite on bg
    scale,
  });
}

function drawDuotone(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  duoA = "#f784c5",
  duoB = "#1b602f",
  accent = "#000072"
) {
  // radial glow
  const radial = ctx.createRadialGradient(w * 0.2, h * 0.2, 0, w * 0.2, h * 0.2, Math.max(w, h) * 0.6);
  radial.addColorStop(0, duoA + "66"); // ~40% (66 hex)
  radial.addColorStop(1, "#00000000");
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, w, h);

  // diagonal duotone sweep
  const linear = ctx.createLinearGradient(0, 0, w, h);
  linear.addColorStop(0, duoA + "73"); // ~45%
  linear.addColorStop(1, duoB + "73");
  ctx.fillStyle = linear;
  ctx.fillRect(0, 0, w, h);

  // subtle accent from top
  const top = ctx.createLinearGradient(0, 0, 0, h);
  top.addColorStop(0, accent + "1A"); // ~10%
  top.addColorStop(1, "#00000000");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "source-over";
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

export async function renderCurrentToCanvas(): Promise<HTMLCanvasElement> {
  const root = (document.getElementById("capture-root") ||
    document.body) as HTMLElement;

  // Compute size from the root to preserve layout aspect
  const rect = root.getBoundingClientRect();
  const scale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 2));
  const width = Math.max(800, Math.round(rect.width));
  const height = Math.max(600, Math.round(rect.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;

  // Fill base with --surface
  const surface =
    getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() ||
    "#0f0f11";
  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw background image (grayscale, 20% like page)
  const bgImageCss =
    getComputedStyle(document.documentElement).getPropertyValue("--bg-image");
  const match = /url\("(.*)"\)/.exec(bgImageCss);
  if (match && match[1]) {
    try {
      const img = await loadImage(match[1]);
      // cover
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const cw = canvas.width;
      const ch = canvas.height;
      const imgRatio = iw / ih;
      const canRatio = cw / ch;
      let dw = cw;
      let dh = ch;
      if (imgRatio > canRatio) {
        // image wider
        dh = ch;
        dw = dh * imgRatio;
      } else {
        // image taller
        dw = cw;
        dh = dw / imgRatio;
      }
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      // draw grayscale by drawing, then desaturate
      ctx.save();
      ctx.globalAlpha = getNumberFromCssVar("--bg-opacity", 0.2); // ~0.2
      ctx.drawImage(img, dx, dy, dw, dh);

      // grayscale pass
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
          g = data[i + 1],
          b = data[i + 2];
        // perceptual grayscale
        const gray = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.restore();
    } catch {
      // ignore bg failure
    }
  }

  // Duotone & accent overlays using same CSS vars
  const duoA =
    getComputedStyle(document.documentElement).getPropertyValue("--duo-a").trim() ||
    "#f784c5";
  const duoB =
    getComputedStyle(document.documentElement).getPropertyValue("--duo-b").trim() ||
    "#1b602f";
  const accent =
    getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
    "#000072";
  drawDuotone(ctx, canvas.width, canvas.height, duoA, duoB, accent);

  // Raster the DOM node (WYSIWYG) and composite centered
  const nodeCanvas = await rasterNode(root, scale);
  ctx.drawImage(nodeCanvas, 0, 0);

  return canvas;
}

/* ---------------------------
 * SHARE / COPY / DOWNLOAD
 * -------------------------- */
export async function exportBlob(type = "image/png", quality?: number) {
  const canvas = await renderCurrentToCanvas();
  return await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b!), type, quality)
  );
}

export async function downloadCurrent(filename = "kamibertanya.png") {
  const blob = await exportBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyCurrent() {
  const blob = await exportBlob();
  // Try navigator.clipboard.write
  const item = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

export async function shareCurrent() {
  const blob = await exportBlob();
  const file = new File([blob], "kamibertanya.png", { type: blob.type, lastModified: Date.now() });

  if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
    await (navigator as any).share({
      files: [file],
      title: "Kami Bertanya",
      text: "Dibagikan dari Kami Bertanya",
    });
    return "shared";
  }

  // Fallback to copy, then download
  try {
    await copyCurrent();
    return "copied";
  } catch {
    await downloadCurrent();
    return "downloaded";
  }
}

/** Wire the share button */
export function setupShare() {
  const btn = document.getElementById("share-button");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    btn.setAttribute("disabled", "true");
    try {
      const result = await shareCurrent();
      // (Optional) toast based on result
      console.info("Share result:", result);
    } catch (e) {
      console.error(e);
    } finally {
      btn.removeAttribute("disabled");
    }
  });
}

/** Optional: if your app already has a "Change question" button, keep behavior */
export function setupReloadButton(handler?: () => void) {
  const btn = document.getElementById("reload-button");
  if (!btn) return;
  if (handler) {
    btn.addEventListener("click", handler);
  }
}

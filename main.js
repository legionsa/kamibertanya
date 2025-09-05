/* ============== Minimal state ============== */
// ADD: list your images here (relative to index.html)
const IMAGES = [
  'src/images/bg1.jpg',
  'src/images/bg2.jpg',
  'src/images/bg3.jpg'
];

/* Utilities */
const pick = (a) => a[Math.floor(Math.random()*a.length)];
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
function jitter(hex, j=8){
  const h = hex.replace('#','');
  const f = h.length===3 ? h.split('').map(c=>c+c).join('') : h;
  const n = parseInt(f, 16);
  let r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  const rnd=v=>clamp(v + Math.round((Math.random()*2-1)*j), 0, 255);
  r=rnd(r); g=rnd(g); b=rnd(b);
  const H=x=>x.toString(16).padStart(2,'0');
  return `#${H(r)}${H(g)}${H(b)}`;
}
function setVar(name, value){ document.documentElement.style.setProperty(name, value); }

/* ============== Theme + Background handling ============== */
function applyRandomBackgroundAndDuotone(){
  if (IMAGES.length) setVar('--bg-image', `url("${pick(IMAGES)}")`);
  // slight variation but stays around your brand colors
  setVar('--duo-a', jitter('#f784c5', 10));
  setVar('--duo-b', jitter('#1b602f', 10));
  setVar('--accent', jitter('#000072', 6));
}

function toggleTheme(){
  // simple dark/light flip; ensure text contrast (choose white/black/blue)
  const curr = getComputedStyle(document.documentElement).getPropertyValue('--theme-background').trim() || '#0f0f11';
  const next = (curr.toLowerCase()==='#0f0f11') ? '#f6f7f8' : '#0f0f11';
  setVar('--theme-background', next);

  // pick readable text color
  const best = pickReadableTextColor(next, ['#ffffff', '#000000', '#000072']);
  setVar('--theme-foreground', best);

  // randomize background + duotone
  applyRandomBackgroundAndDuotone();
}

/* WCAG helpers (for text color) */
function srgbToLin(c){ const s=c/255; return s<=0.03928? s/12.92 : Math.pow((s+0.055)/1.055, 2.4); }
function hexToRgb(hex){ const h=hex.replace('#',''); const f=h.length===3?h.split('').map(c=>c+c).join(''):h; const n=parseInt(f,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
function luminance(hex){ const [r,g,b]=hexToRgb(hex); return 0.2126*srgbToLin(r)+0.7152*srgbToLin(g)+0.0722*srgbToLin(b); }
function contrastRatio(fg,bg){ const L1=luminance(fg), L2=luminance(bg); const [hi,lo]=L1>L2?[L1,L2]:[L2,L1]; return (hi+0.05)/(lo+0.05); }
function pickReadableTextColor(bg, candidates){ 
  const passing=candidates.map(c=>({c,r:contrastRatio(c,bg)})).filter(x=>x.r>=4.5).sort((a,b)=>b.r-a.r);
  if (passing.length) return passing[0].c;
  return candidates.sort((a,b)=>contrastRatio(b,bg)-contrastRatio(a,bg))[0];
}

/* ============== WYSIWYG Export (exactly matches on-screen) ============== */
async function captureShareImage(){
  const target = document.querySelector('#capture-root') || document.body;

  // 1) DOM snapshot with transparent background
  const scale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 2));
  const domCanvas = await window.html2canvas(target, { backgroundColor: null, scale });
  const W = domCanvas.width, H = domCanvas.height;

  // 2) compositor canvas
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 3) read CSS variables (the single source of truth)
  const css = getComputedStyle(document.documentElement);
  const surface = (css.getPropertyValue('--theme-background') || '#0f0f11').trim();
  const duoA    = (css.getPropertyValue('--duo-a') || '#f784c5').trim();
  const duoB    = (css.getPropertyValue('--duo-b') || '#1b602f').trim();
  const accent  = (css.getPropertyValue('--accent') || '#000072').trim();
  const bgVar   = css.getPropertyValue('--bg-image');
  const bgOp    = parseFloat(css.getPropertyValue('--bg-opacity')) || 0.2;
  const match   = /url\("(.*)"\)/.exec(bgVar);
  const bgUrl   = match ? match[1] : null;

  // 4) base fill (surface)
  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, W, H);

  // helper: grayscale pass
  function grayify(){
    const imgData = ctx.getImageData(0,0,W,H);
    const d = imgData.data;
    for (let i=0;i<d.length;i+=4){
      const r=d[i], g=d[i+1], b=d[i+2];
      const gy = Math.round(0.2126*r + 0.7152*g + 0.0722*b);
      d[i]=d[i+1]=d[i+2]=gy;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  // 5) background image (cover) @ ~20% + grayscale
  if (bgUrl){
    await new Promise((res, rej)=>{
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = ()=>{
        const iw=img.naturalWidth, ih=img.naturalHeight;
        const ir=iw/ih, cr=W/H;
        let dw=W, dh=H;
        if (ir>cr){ dh=H; dw=dh*ir; } else { dw=W; dh=dw/ir; }
        const dx=(W-dw)/2, dy=(H-dh)/2;

        ctx.save();
        ctx.globalAlpha = bgOp;
        ctx.drawImage(img, dx, dy, dw, dh);
        grayify();
        ctx.restore();
        res();
      };
      img.onerror = rej;
      img.src = bgUrl;
    });
  }

  // 6) duotone + accent overlay (multiply)
  (function addDuotone(){
    const radial = ctx.createRadialGradient(W*0.2, H*0.2, 0, W*0.2, H*0.2, Math.max(W,H)*0.6);
    radial.addColorStop(0, duoA + '66'); // ~40%
    radial.addColorStop(1, '#0000');
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = radial; ctx.fillRect(0,0,W,H);

    const lin = ctx.createLinearGradient(0,0,W,H);
    lin.addColorStop(0, duoA + '73'); // ~45%
    lin.addColorStop(1, duoB + '73');
    ctx.fillStyle = lin; ctx.fillRect(0,0,W,H);

    const top = ctx.createLinearGradient(0,0,0,H);
    top.addColorStop(0, accent + '1A'); // ~10%
    top.addColorStop(1, '#0000');
    ctx.fillStyle = top; ctx.fillRect(0,0,W,H);

    ctx.globalCompositeOperation = 'source-over';
  })();

  // 7) draw DOM on top (what users see)
  ctx.drawImage(domCanvas, 0, 0);

  // 8) return blob + file
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1));
  const file = new File([blob], 'icebreaker.png', { type: 'image/png' });
  return { blob, file };
}

/* ============== Share / Copy / Download ============== */
async function shareImage(){
  const { blob, file } = await captureShareImage();

  if (navigator.canShare && navigator.canShare({ files: [file] })){
    await navigator.share({ files:[file], title:'Kami Bertanya', text:'Dibagikan dari Kami Bertanya' });
    return;
  }
  // fallback to copy, then download
  try{
    const item = new ClipboardItem({ [blob.type]: blob });
    await navigator.clipboard.write([item]);
  }catch{
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'icebreaker.png';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
}

async function downloadImage(){
  const { blob } = await captureShareImage();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'icebreaker.png';
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

async function copyImage(){
  const { blob } = await captureShareImage();
  const item = new ClipboardItem({ [blob.type]: blob });
  await navigator.clipboard.write([item]);
}

/* ============== Init ============== */
function init(){
  // initial theme/text contrast
  setVar('--theme-background', '#0f0f11');
  setVar('--theme-foreground', pickReadableTextColor('#0f0f11', ['#ffffff','#000000','#000072']));

  // initial background + duotone
  applyRandomBackgroundAndDuotone();

  // wire UI
  document.getElementById('post-link')?.addEventListener('click', shareImage);
  document.getElementById('download-image')?.addEventListener('click', downloadImage);
  document.getElementById('copy-image')?.addEventListener('click', copyImage);
  document.getElementById('reload-button')?.addEventListener('click', ()=> {
    // you can swap question text here if you want
  });
  document.getElementById('change-theme-button')?.addEventListener('click', toggleTheme);

  // (optional) keyboard: T to toggle theme
  window.addEventListener('keydown', (e)=> {
    if (e.key.toLowerCase() === 't') toggleTheme();
  });
}

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

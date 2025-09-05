(()=>{"use strict";var e=function(){return e=Object.assign||function(e){for(var t,n=1,r=arguments.length;n<r;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},e.apply(this,arguments)},t=function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))},n="icebreaker-questions",r="icebreaker-index",o="icebreaker-theme",i=function(e){return e.slice(e.indexOf("*")+1).trim()},u={name:"Carnival",background:"#2B50AA",foreground:"#FF9FE5",highlight:"#FF9FE5",font:"Rammetto One"},c=function(){var e=document.querySelector("main"),t=e.clientWidth,n=e.clientHeight,r=document.querySelector("#question-display");if(r.style.fontSize="",!(t>=600&&n>=600)){document.documentElement.classList.add("font-resizing");var o=function(t,n,i,u){void 0===u&&(u=100),void 0===t?setTimeout((function(){var t=e.getBoundingClientRect().width,n=e.getBoundingClientRect().height;o(8,t,n)}),1):(r.style.fontSize=t+"rem",setTimeout((function(){(r.getBoundingClientRect().width>n||r.getBoundingClientRect().height>i)&&u>0?o(t-.1,n,i,u-1):document.documentElement.classList.remove("font-resizing")}),1))};o()}},a=function(e){var n="https://fonts.googleapis.com/css?family="+e.replace(/\s/g,"+").replace(/\"/g,"")+"&display=swap";if(function(e){return(n=[],document.fonts.forEach((function(e){return n.push(e)})),n.reduce((function(e,n){return e.includes(n.family)?e:t(t([],e,!0),[n.family],!1)}),[])).some((function(t){return t.family===e}));var n}(e))c();else{var r=document.createElement("link");r.href=n,r.rel="stylesheet";var o=e.includes(" ")?'"'+e+'"':e;r.addEventListener("load",(function(){document.documentElement.style.setProperty("--theme-font",o),c()})),r.addEventListener("error",(function(){e!==u.font&&a(u.font)})),document.head.appendChild(r)}},l=function(e){var t=document.documentElement;t.style.setProperty("--theme-foreground",e.foreground),t.style.setProperty("--theme-background",e.background),t.style.setProperty("--theme-highlight",e.highlight),a(e.font),document.querySelector("#question-display").style.fontSize="",window.localStorage.setItem(o,JSON.stringify(e)),console.info("Theme "+e.name)},d=function(e){return fetch(e).then((function(e){return e.text()}))},f=function(e){return e.split("\n").filter((function(e){return e.match(/^\*/)})).map((function(e){return new RegExp(/^\* _([\w \d]*)_ ([\w#]*) ([\w#]*) ([\w#]*) _([\w \d]*?)_$/).exec(e)})).map((function(e){var t=e[1],n=e[2];return{name:t,foreground:e[3],background:n,highlight:e[4],font:e[5]}}))};new Promise((function(t){var n=function(){var t=window.localStorage.getItem(o)||"default-theme";try{var n=JSON.parse(t);return function(e){return"string"!=typeof e&&"foreground"in e}(n)?e(e({},u),n):u}catch(e){return u}}();l(n),window.addEventListener("resize",function(e,t){void 0===t&&(t=250);var n=null;return function(){for(var r=[],o=0;o<arguments.length;o++)r[o]=arguments[o];window.clearTimeout(n),n=window.setTimeout((function(){e.apply(void 0,r)}),t)}}(c)),t()})).then((function(){return d("QUESTIONS.md").then((function(e){return e.split("\n").filter((function(e){return e.match(/^\s*\*/)})).map(i)}))})).then((function(e){var o,i=null!==(o=null===localStorage||void 0===localStorage?void 0:localStorage.getItem(n))&&void 0!==o?o:"[]",u=JSON.parse(i),c=e.filter((function(e){return!e.startsWith("Credit: ")}));if(u.length===c.length)return u;var a,l=function(e){var n=e.reduce((function(e,n){var r=e[0],o=e[1];if(n.startsWith("Credit:")){var i=function(e){var t=RegExp(/Credit:\s*\[(.*)\]\((.*)\)/gm).exec(e);return{name:t[1],href:t[2]}}(n);return[i,o]}return[r,t(t([],o,!0),[{question:n,credit:r}],!1)]}),[{name:"",href:""},[]]);return n[0],n[1]}(e),d=(a=l).reduce((function(e,t,n){var r,o=Math.floor(Math.random()*(n+1));return r=[e[o],e[n]],e[n]=r[0],e[o]=r[1],e}),t([],a,!0));try{localStorage.setItem(n,JSON.stringify(d)),localStorage.setItem(r,"0")}catch(e){}return d})).then((function(e){var t,n,o,i,u,a=null!==(t=localStorage.getItem(r))&&void 0!==t?t:"0",l=parseInt(a);("navigate"===(null===(o=null===(n=null===performance||void 0===performance?void 0:performance.getEntriesByType("navigation"))||void 0===n?void 0:n[0])||void 0===o?void 0:o.type)||(null===(i=null===performance||void 0===performance?void 0:performance.navigation)||void 0===i?void 0:i.type)===(null===(u=null===performance||void 0===performance?void 0:performance.navigation)||void 0===u?void 0:u.TYPE_NAVIGATE))&&l>0&&(l+=1);var d=function(e){document.querySelector("#question-display").innerHTML=e.question;var t=document.querySelector("#credit-link");t.href=e.credit.href,t.innerHTML=e.credit.name;var n=document.querySelector("#post-link"),r=n.dataset.origin+"/"+e.question.toLowerCase().replace(/ /g,"-").replace(/[^\w-]+/g,"").replace(/_/g,"").replace(/-{2,}/g,"-").replace(/-$/,"").replace(/^-/,"");n.href=r,c()};d(e[l]),document.querySelector("#reload-button").addEventListener("click",(function(){document.documentElement.classList.contains("font-resizing")||(l=(l+1)%e.length,localStorage.setItem(r,l.toString()),window.history.pushState(l,e[l].question),d(e[l]))})),window.onpopstate=function(){var t,n=null!==(t=window.history.state)&&void 0!==t?t:0;localStorage.setItem(r,n.toString()),d(e[n])}})).then((function(){return e=void 0,t=void 0,r=function(){var e;return function(e,t){var n,r,o,i,u={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return i={next:c(0),throw:c(1),return:c(2)},"function"==typeof Symbol&&(i[Symbol.iterator]=function(){return this}),i;function c(i){return function(c){return function(i){if(n)throw new TypeError("Generator is already executing.");for(;u;)try{if(n=1,r&&(o=2&i[0]?r.return:i[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,i[1])).done)return o;switch(r=0,o&&(i=[2&i[0],o.value]),i[0]){case 0:case 1:o=i;break;case 4:return u.label++,{value:i[1],done:!1};case 5:u.label++,r=i[1],i=[0];continue;case 7:i=u.ops.pop(),u.trys.pop();continue;default:if(!((o=(o=u.trys).length>0&&o[o.length-1])||6!==i[0]&&2!==i[0])){u=0;continue}if(3===i[0]&&(!o||i[1]>o[0]&&i[1]<o[3])){u.label=i[1];break}if(6===i[0]&&u.label<o[1]){u.label=o[1],o=i;break}if(o&&u.label<o[2]){u.label=o[2],u.ops.push(i);break}o[2]&&u.ops.pop(),u.trys.pop();continue}i=t.call(e,u)}catch(e){i=[6,e],r=0}finally{n=o=0}if(5&i[0])throw i[1];return{value:i[0]?i[1]:void 0,done:!0}}([i,c])}}}(this,(function(t){switch(t.label){case 0:return[4,d("THEMES.md").then(f)];case 1:return e=t.sent(),document.querySelector("#change-theme-button").addEventListener("click",(function(){document.querySelector("body").classList.add("themed");var t=document.documentElement.style.getPropertyValue("--theme-foreground"),n=document.documentElement.style.getPropertyValue("--theme-background"),r=document.documentElement.style.getPropertyValue("--theme-highlight"),o=document.documentElement.style.getPropertyValue("--theme-font").replace(/"/g,""),i=e.findIndex((function(e){return e.background===n&&e.foreground===t&&e.highlight===r&&e.font===o})),u=-1===i?0:(i+1)%e.length,c=e[u];l(c)})),[2]}}))},new((n=void 0)||(n=Promise))((function(o,i){function u(e){try{a(r.next(e))}catch(e){i(e)}}function c(e){try{a(r.throw(e))}catch(e){i(e)}}function a(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(u,c)}a((r=r.apply(e,t||[])).next())}));var e,t,n,r}))})();
// ---------------- Share configuration ----------------
const CREDIT_NAME = 'Kalvin';
const CREDIT_URL  = 'https://www.linkedin.com/in/hikalvin/';
const WATERMARK_1 = `Iseng2nya ${CREDIT_NAME} — ${CREDIT_URL}`;
const WATERMARK_2 = 'KnowBetter based on Icebreakers';

// Which element to capture:
const CAPTURE_SELECTOR = 'main'; // or '#question-display' if you only want the text bubble

// -----------------------------------------------------

function getComputedBgColor(el) {
  const bg = getComputedStyle(el).backgroundColor;
  // fallback to body if transparent
  if (!bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
    return getComputedStyle(document.body).backgroundColor || '#ffffff';
  }
  return bg;
}

// EXACT WYSIWYG capture: theme surface + bg image (20% grayscale) + duotone + accent + DOM (+ watermark)
async function captureShareImage() {
  // Keep your existing CAPTURE_SELECTOR or fallback to body
  const CAPTURE_SELECTOR = '#app, main, body';
  const target = document.querySelector(CAPTURE_SELECTOR) || document.body;

  // 1) Raster the DOM with a transparent background (so we can composite behind it)
  const scale = Math.min(2, Math.max(1.5, window.devicePixelRatio || 2));
  const domCanvas = await html2canvas(target, {
    backgroundColor: null,
    scale
  });
  const W = domCanvas.width;
  const H = domCanvas.height;

  // 2) Prepare a compositor canvas
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // 3) Read the SAME CSS variables the page uses (so export == on-screen)
  const rootStyle = getComputedStyle(document.documentElement);
  const surface = (rootStyle.getPropertyValue('--theme-background') || rootStyle.getPropertyValue('--surface') || '#ffffff').trim();
  const duoA    = (rootStyle.getPropertyValue('--duo-a') || '#f784c5').trim();
  const duoB    = (rootStyle.getPropertyValue('--duo-b') || '#1b602f').trim();
  const accent  = (rootStyle.getPropertyValue('--accent') || '#000072').trim();
  const bgVar   = rootStyle.getPropertyValue('--bg-image');
  const bgOp    = parseFloat(rootStyle.getPropertyValue('--bg-opacity')) || 0.2;
  const urlMatch = /url\("(.*)"\)/.exec(bgVar);
  const bgUrl    = urlMatch ? urlMatch[1] : null;

  // 4) Base fill with theme surface (ensures text contrast matches your page)
  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, W, H);

  // Helpers
  function grayify(context) {
    const imgData = context.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const gy = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
      d[i] = d[i + 1] = d[i + 2] = gy;
    }
    context.putImageData(imgData, 0, 0);
  }

  function addDuotoneOverlay() {
    // Multiply-like duotone + subtle accent, mirrors your CSS overlay
    const radial = ctx.createRadialGradient(W * 0.2, H * 0.2, 0, W * 0.2, H * 0.2, Math.max(W, H) * 0.6);
    radial.addColorStop(0, duoA + '66'); // ~40%
    radial.addColorStop(1, '#0000');
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = radial; ctx.fillRect(0, 0, W, H);

    const lin = ctx.createLinearGradient(0, 0, W, H);
    lin.addColorStop(0, duoA + '73'); // ~45%
    lin.addColorStop(1, duoB + '73');
    ctx.fillStyle = lin; ctx.fillRect(0, 0, W, H);

    const top = ctx.createLinearGradient(0, 0, 0, H);
    top.addColorStop(0, accent + '1A'); // ~10%
    top.addColorStop(1, '#0000');
    ctx.fillStyle = top; ctx.fillRect(0, 0, W, H);

    ctx.globalCompositeOperation = 'source-over';
  }

  // 5) Draw the same background image (cover), opacity ≈ 0.2, then grayscale
  if (bgUrl) {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // harmless if same-origin; enables canvas export with CDNs that send CORS headers
      img.onload = () => {
        // cover fit
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const ir = iw / ih, cr = W / H;
        let dw = W, dh = H;
        if (ir > cr) { dh = H; dw = dh * ir; } else { dw = W; dh = dw / ir; }
        const dx = (W - dw) / 2, dy = (H - dh) / 2;

        ctx.save();
        ctx.globalAlpha = bgOp;        // ~0.2
        ctx.drawImage(img, dx, dy, dw, dh);
        grayify(ctx);                   // match the page’s grayscale filter
        ctx.restore();
        resolve();
      };
      img.onerror = reject;
      img.src = bgUrl;
    });
  }

  // 6) Add the same duotone + accent overlay your CSS applies
  addDuotoneOverlay();

  // 7) Paint the DOM snapshot on top (what users see)
  ctx.drawImage(domCanvas, 0, 0);

  // 8) Keep your existing watermark strip if you draw one later in this function
  // (If your code already adds the “Got a nice answer? …” strip, leave that code after this line.)

  // 9) Return blob + file for share / copy / download flows (unchanged API)
  const blob = await new Promise(res => canvas.toBlob(res, 'image/png', 1));
  const file = new File([blob], 'icebreaker.png', { type: 'image/png' });
  return { blob, file };
}


function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openLinkedInShare(pageUrl) {
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

async function shareQuestion() {
  const questionEl = document.getElementById('question-display');
  const questionText = (questionEl?.innerText || '').trim();
  const pageUrl = location.href;

  try {
    const { blob, file } = await captureShareImage();

    // Web Share API with files (best on Android Chrome)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Icebreaker',
        text: questionText || 'Icebreaker question',
      });
      return;
    }

    // Fallback: open LinkedIn share for your page, download image for IG Story
    openLinkedInShare(pageUrl);
    downloadBlob(blob, 'icebreaker.png');
    alert(
      "We opened LinkedIn’s share in a new tab.\n\n" +
      "Instagram Story doesn’t accept direct web posting everywhere. " +
      "We downloaded the image for you—open Instagram and add it to your Story."
    );
  } catch (err) {
    console.error('Share failed:', err);
    alert('Sharing failed. Please try again or save the image and share it manually.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Enforce the credit footer consistently
  const creditEl = document.getElementById('credit-link');
  if (creditEl) {
    creditEl.href = CREDIT_URL;
    creditEl.textContent = CREDIT_NAME;
    creditEl.rel = 'noopener noreferrer';
    creditEl.target = '_blank';
  }

  const shareLink = document.getElementById('post-link');
  if (shareLink) {
    shareLink.addEventListener('click', (e) => {
      e.preventDefault();
      shareQuestion();
    });
  }
});

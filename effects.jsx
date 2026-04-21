// effects.jsx — six real recursion effects, all drawn to a 2D canvas using
// the previous frame as feedback. Each effect takes (ctx, videoEl, params, persistent)
// and renders one frame. `persistent` is an object the effect can mutate across frames.

const { useRef, useEffect, useState, useCallback } = React;

const EFFECTS = [
  { id: 'kaleido',   name: 'KALEIDO',   label: 'Kaleidoscope',        hint: 'Mirror tile symmetry' },
  { id: 'echo',      name: 'ECHO',      label: 'Feedback Delay',      hint: 'Video trails + decay' },
  { id: 'droste',    name: 'DROSTE',    label: 'Droste',              hint: 'Picture-in-picture spiral' },
  { id: 'tunnel',    name: 'TUNNEL',    label: 'Infinity Tunnel',     hint: 'Recursive zoom' },
  { id: 'poster',    name: 'POSTER',    label: 'Posterize Layers',    hint: 'Color-quantized stacking' },
  { id: 'slitscan',  name: 'SLIT',      label: 'Slit-Scan',           hint: 'Time per scanline' },
];

// Utility: draw video scaled "cover" into a target rect
function drawVideoCover(ctx, v, dx, dy, dw, dh) {
  if (!v || !v.videoWidth) return;
  const vr = v.videoWidth / v.videoHeight;
  const tr = dw / dh;
  let sx = 0, sy = 0, sw = v.videoWidth, sh = v.videoHeight;
  if (vr > tr) {
    sw = v.videoHeight * tr;
    sx = (v.videoWidth - sw) / 2;
  } else {
    sh = v.videoWidth / tr;
    sy = (v.videoHeight - sh) / 2;
  }
  ctx.drawImage(v, sx, sy, sw, sh, dx, dy, dw, dh);
}

// Kaleidoscope: draw a wedge, then reflect it N times
function renderKaleido(ctx, v, p) {
  const { width: w, height: h } = ctx.canvas;
  const slices = Math.max(3, Math.round(p.depth));
  const angle = (Math.PI * 2) / slices;
  const rot = (p.rotation * Math.PI) / 180;
  const scale = p.scale;
  const R = Math.hypot(w, h) / 2;

  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rot);

  for (let i = 0; i < slices; i++) {
    ctx.save();
    ctx.rotate(i * angle);
    if (i % 2 === 1) ctx.scale(1, -1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(R, -Math.tan(angle / 2) * R);
    ctx.lineTo(R, Math.tan(angle / 2) * R);
    ctx.closePath();
    ctx.clip();
    ctx.scale(scale, scale);
    drawVideoCover(ctx, v, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.restore();
}

// Echo: draw current frame on top of prior frame with fade
function renderEcho(ctx, v, p, per) {
  const { width: w, height: h } = ctx.canvas;
  // fade prior frame
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = `rgba(0,0,0,${1 - p.opacity})`;
  ctx.fillRect(0, 0, w, h);
  // draw new frame with slight transform and blend
  ctx.globalCompositeOperation = p.blend || 'lighter';
  const s = p.scale;
  const rot = (p.rotation * Math.PI) / 180;
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rot * 0.05);
  ctx.scale(s, s);
  ctx.globalAlpha = p.opacity;
  drawVideoCover(ctx, v, -w / 2, -h / 2, w, h);
  ctx.restore();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// Droste: recursive picture-in-picture. Redraw current canvas into a rotated/scaled window.
function renderDroste(ctx, v, p, per) {
  const { width: w, height: h } = ctx.canvas;
  drawVideoCover(ctx, v, 0, 0, w, h);
  const depth = Math.max(1, Math.round(p.depth));
  const s = Math.min(0.92, Math.max(0.3, p.scale * 0.7 + 0.3));
  const rot = (p.rotation * Math.PI) / 180;

  // snapshot current canvas once per frame
  if (!per.snap || per.snap.width !== w || per.snap.height !== h) {
    per.snap = document.createElement('canvas');
    per.snap.width = w;
    per.snap.height = h;
  }
  per.snap.getContext('2d').drawImage(ctx.canvas, 0, 0);

  for (let i = 1; i <= depth; i++) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rot * i);
    const sc = Math.pow(s, i);
    ctx.scale(sc, sc);
    ctx.globalAlpha = Math.max(0.2, p.opacity);
    ctx.drawImage(per.snap, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// Tunnel: feedback loop — draw previous canvas scaled down/up from center, over new frame
function renderTunnel(ctx, v, p, per) {
  const { width: w, height: h } = ctx.canvas;
  if (!per.snap || per.snap.width !== w || per.snap.height !== h) {
    per.snap = document.createElement('canvas');
    per.snap.width = w;
    per.snap.height = h;
  }
  // snapshot previous frame
  per.snap.getContext('2d').drawImage(ctx.canvas, 0, 0);

  // new camera frame
  drawVideoCover(ctx, v, 0, 0, w, h);

  // overlay prior frame, zoomed in (tunnel-in) with slight rotation
  const zoom = 1 + 0.04 * p.speed;
  const rot = (p.rotation * Math.PI) / 180 * 0.1;
  const depth = Math.max(1, Math.round(p.depth));
  for (let i = 0; i < depth; i++) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rot * (i + 1));
    const z = Math.pow(zoom, i + 1);
    ctx.scale(z, z);
    ctx.globalAlpha = p.opacity * Math.pow(0.85, i);
    ctx.globalCompositeOperation = p.blend || 'source-over';
    ctx.drawImage(per.snap, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// Posterize: quantize colors into N bands, stacked with offsets
function renderPoster(ctx, v, p, per) {
  const { width: w, height: h } = ctx.canvas;
  // draw base frame
  drawVideoCover(ctx, v, 0, 0, w, h);
  // quantize by reading pixels
  const bands = Math.max(2, Math.min(8, Math.round(p.depth)));
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const step = 255 / (bands - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.round(d[i] / step) * step;
    d[i + 1] = Math.round(d[i + 1] / step) * step;
    d[i + 2] = Math.round(d[i + 2] / step) * step;
  }
  ctx.putImageData(img, 0, 0);

  // stack rotated copies with blend
  if (!per.snap || per.snap.width !== w || per.snap.height !== h) {
    per.snap = document.createElement('canvas');
    per.snap.width = w;
    per.snap.height = h;
  }
  per.snap.getContext('2d').drawImage(ctx.canvas, 0, 0);
  const rot = (p.rotation * Math.PI) / 180;
  const layers = Math.max(1, Math.min(6, Math.round(p.depth - 1)));
  ctx.globalCompositeOperation = p.blend || 'screen';
  for (let i = 1; i <= layers; i++) {
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rot * i * 0.3);
    const sc = Math.pow(p.scale, i * 0.3);
    ctx.scale(sc, sc);
    ctx.globalAlpha = p.opacity * 0.6;
    ctx.drawImage(per.snap, -w / 2, -h / 2, w, h);
    ctx.restore();
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}

// Slit-scan: each horizontal row comes from a different past frame
function renderSlitScan(ctx, v, p, per) {
  const { width: w, height: h } = ctx.canvas;
  const buffers = Math.max(4, Math.min(48, Math.round(p.depth * 4)));
  if (!per.history || per.history.length !== buffers) {
    per.history = [];
    for (let i = 0; i < buffers; i++) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      per.history.push(c);
    }
    per.cursor = 0;
  }
  // write current frame into rolling buffer
  const cur = per.history[per.cursor];
  cur.getContext('2d').drawImage(v, 0, 0, w, h);
  per.cursor = (per.cursor + 1) % per.history.length;

  // render each row from a different buffer based on its y
  const rowsPerBand = Math.max(1, Math.floor(h / per.history.length));
  for (let i = 0; i < per.history.length; i++) {
    const buf = per.history[(per.cursor + i) % per.history.length];
    const y = i * rowsPerBand;
    const rh = (i === per.history.length - 1) ? (h - y) : rowsPerBand;
    ctx.drawImage(buf, 0, y, w, rh, 0, y, w, rh);
  }
  // subtle overlay of live frame
  ctx.globalAlpha = Math.max(0, p.opacity - 0.5);
  drawVideoCover(ctx, v, 0, 0, w, h);
  ctx.globalAlpha = 1;
}

const RENDERERS = {
  kaleido: renderKaleido,
  echo: renderEcho,
  droste: renderDroste,
  tunnel: renderTunnel,
  poster: renderPoster,
  slitscan: renderSlitScan,
};

Object.assign(window, { EFFECTS, RENDERERS });

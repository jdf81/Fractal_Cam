// ui.jsx — small UI primitives: icons, sliders, chips, bottom sheet

const { useRef: uiUseRef, useEffect: uiUseEffect, useState: uiUseState } = React;

const COLORS = {
  bg: '#0A0A0B',
  bgElev: '#121214',
  line: 'rgba(255,255,255,0.08)',
  lineStrong: 'rgba(255,255,255,0.14)',
  fg: '#F2F2F0',
  dim: 'rgba(242,242,240,0.55)',
  dimmer: 'rgba(242,242,240,0.35)',
  accent: 'oklch(0.78 0.14 70)',
  accentDim: 'oklch(0.78 0.14 70 / 0.18)',
  rec: 'oklch(0.65 0.22 28)',
};

const FONT_MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const FONT_UI = '-apple-system, "SF Pro", Inter, system-ui, sans-serif';

// ─── Icons ─────────────────────────────────────────────
const Icon = ({ name, size = 20, color = 'currentColor', stroke = 1.6 }) => {
  const s = stroke;
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: s, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'flip': return <svg {...common}><path d="M15 3h4a2 2 0 012 2v4"/><path d="M9 21H5a2 2 0 01-2-2v-4"/><path d="M3 9V5a2 2 0 012-2h4"/><path d="M21 15v4a2 2 0 01-2 2h-4"/><path d="M8 12l-2-2 2-2"/><path d="M16 12l2 2-2 2"/></svg>;
    case 'close': return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'settings': return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
    case 'grid': return <svg {...common}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'gallery': return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
    case 'flash': return <svg {...common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    case 'timer': return <svg {...common}><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/></svg>;
    case 'bolt': return <svg {...common}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
    case 'video': return <svg {...common}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>;
    case 'camera': return <svg {...common}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case 'save': return <svg {...common}><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
    case 'chevron-down': return <svg {...common}><polyline points="6 9 12 15 18 9"/></svg>;
    case 'chevron-up': return <svg {...common}><polyline points="18 15 12 9 6 15"/></svg>;
    case 'plus': return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case 'arrow-left': return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case 'check': return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'dot': return <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill={color}/></svg>;
    case 'target': return <svg {...common}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
    case 'spiral': return <svg {...common}><path d="M12 12a4 4 0 118 0c0 6-6 8-10 8S2 18 2 12 6 2 12 2a8 8 0 018 8"/></svg>;
    case 'layers': return <svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
    case 'wave': return <svg {...common}><path d="M2 12c3 0 3-6 6-6s3 6 6 6 3-6 6-6M2 18c3 0 3-6 6-6s3 6 6 6 3-6 6-6"/></svg>;
    case 'kaleid': return <svg {...common}><path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/></svg>;
    default: return null;
  }
};

const EFFECT_ICONS = {
  kaleido: 'kaleid',
  echo: 'wave',
  droste: 'spiral',
  tunnel: 'target',
  poster: 'layers',
  slitscan: 'grid',
};

// ─── Precision slider with numeric readout ─────────────
function PrecisionSlider({ label, value, min, max, step = 0.01, onChange, unit = '', precision = 2 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.8, color: COLORS.dim, textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.fg, fontVariantNumeric: 'tabular-nums' }}>
          {Number(value).toFixed(precision)}{unit}
        </span>
      </div>
      <div style={{ position: 'relative', height: 22 }}>
        {/* track */}
        <div style={{ position: 'absolute', top: 10, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.08)' }} />
        {/* fill */}
        <div style={{ position: 'absolute', top: 10, left: 0, width: `${pct}%`, height: 2, background: COLORS.accent }} />
        {/* ticks */}
        {Array.from({ length: 11 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute', left: `${i * 10}%`, top: 6, width: 1, height: 10,
            background: i % 5 === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)',
          }} />
        ))}
        {/* knob */}
        <div style={{
          position: 'absolute', top: 4, left: `calc(${pct}% - 7px)`,
          width: 14, height: 14, borderRadius: 2, background: COLORS.fg,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }} />
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', margin: 0, width: '100%' }}
        />
      </div>
    </div>
  );
}

// ─── Segmented control ────────────────────────────────
function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex', padding: 2, background: 'rgba(255,255,255,0.06)',
      borderRadius: 2, border: `0.5px solid ${COLORS.line}`,
    }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          style={{
            flex: 1, padding: '6px 8px', border: 'none', cursor: 'pointer',
            background: value === opt.value ? COLORS.fg : 'transparent',
            color: value === opt.value ? COLORS.bg : COLORS.dim,
            fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.6,
            textTransform: 'uppercase', borderRadius: 1,
            transition: 'background 0.15s, color 0.15s',
          }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Corner brackets (pro-camera framing) ─────────────
function CornerBrackets({ inset = 16, size = 18, color = 'rgba(255,255,255,0.35)' }) {
  const b = { position: 'absolute', width: size, height: size, borderColor: color, borderStyle: 'solid', borderWidth: 0 };
  return (
    <div style={{ position: 'absolute', inset, pointerEvents: 'none' }}>
      <div style={{ ...b, top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1 }} />
      <div style={{ ...b, top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1 }} />
      <div style={{ ...b, bottom: 0, left: 0, borderBottomWidth: 1, borderLeftWidth: 1 }} />
      <div style={{ ...b, bottom: 0, right: 0, borderBottomWidth: 1, borderRightWidth: 1 }} />
    </div>
  );
}

Object.assign(window, {
  COLORS, FONT_MONO, FONT_UI,
  Icon, EFFECT_ICONS, PrecisionSlider, Segmented, CornerBrackets,
});

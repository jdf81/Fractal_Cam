// capture.jsx — main capture view: camera feed, canvas overlay, HUD, effect strip, quick controls

const { useState: cvUseState, useEffect: cvUseEffect, useRef: cvUseRef, useCallback: cvUseCallback } = React;

function CaptureView({
  videoRef, canvasRef, effect, setEffect, params, setParam,
  onOpenPicker, onOpenPanel, onOpenGallery, lastThumb,
  onShutter, onToggleRecord, recording, onFlipCam, facing,
  usingDemo, recStart,
}) {
  const effectDef = EFFECTS.find(e => e.id === effect);

  // Record timer
  const [recElapsed, setRecElapsed] = cvUseState(0);
  cvUseEffect(() => {
    if (!recording) { setRecElapsed(0); return; }
    const id = setInterval(() => setRecElapsed(Math.floor((Date.now() - recStart) / 1000)), 250);
    return () => clearInterval(id);
  }, [recording, recStart]);
  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: FONT_UI, color: COLORS.fg,
    }}>
      {/* Viewfinder */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
        <canvas ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />

        {/* Top HUD */}
        <div style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          padding: '0 18px', display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', pointerEvents: 'none', zIndex: 2,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: FONT_MONO, fontSize: 10, color: COLORS.fg, letterSpacing: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            <span style={{ color: recording ? COLORS.rec : COLORS.accent }}>● {recording ? `REC ${mmss(recElapsed)}` : 'LIVE'}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>{effectDef.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9 }}>
              D{params.depth} · R{Math.round(params.rotation)}° · S{params.scale.toFixed(2)} · O{params.opacity.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, fontFamily: FONT_MONO, fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            <span>{facing === 'user' ? 'FRONT' : 'BACK'}</span>
            <span>24 FPS</span>
            <span>{usingDemo ? 'DEMO' : 'CAM'}</span>
          </div>
        </div>

        {/* Corner brackets */}
        <CornerBrackets inset={28} size={16} color="rgba(255,255,255,0.25)" />
        {/* Center crosshair */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 2,
          width: 14, height: 14, opacity: 0.45,
        }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: COLORS.fg }} />
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: COLORS.fg }} />
        </div>

        {/* Bottom gradient for legibility */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 140,
          background: 'linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))',
          pointerEvents: 'none', zIndex: 1,
        }} />
      </div>

      {/* Effect filmstrip */}
      <div style={{
        background: COLORS.bg, borderTop: `0.5px solid ${COLORS.line}`,
        padding: '10px 0 6px', position: 'relative', zIndex: 3,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '0 18px 8px',
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.5, color: COLORS.dim }}>
            OPERATOR · {String(EFFECTS.findIndex(e => e.id === effect) + 1).padStart(2, '0')} / 06
          </span>
          <button onClick={onOpenPicker} style={{
            background: 'none', border: 'none', color: COLORS.accent,
            fontFamily: FONT_MONO, fontSize: 9, letterSpacing: 1.2, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4, padding: 0,
          }}>
            ALL <Icon name="grid" size={11} />
          </button>
        </div>
        <div style={{
          display: 'flex', gap: 6, padding: '0 18px', overflowX: 'auto',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
        }}>
          {EFFECTS.map((e, idx) => {
            const sel = e.id === effect;
            return (
              <button key={e.id} onClick={() => setEffect(e.id)} style={{
                flexShrink: 0, minWidth: 78, padding: '10px 10px 8px',
                background: sel ? COLORS.accentDim : 'transparent',
                border: `0.5px solid ${sel ? COLORS.accent : COLORS.line}`,
                cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6,
                alignItems: 'flex-start',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 8, letterSpacing: 1, color: sel ? COLORS.accent : COLORS.dim }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Icon name={EFFECT_ICONS[e.id]} size={14} color={sel ? COLORS.accent : COLORS.dim} stroke={1.3} />
                </div>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.8, color: sel ? COLORS.fg : COLORS.dim }}>
                  {e.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inline quick sliders — always visible (rich density) */}
      <div style={{
        background: COLORS.bg, padding: '10px 20px 4px',
        borderTop: `0.5px solid ${COLORS.line}`, position: 'relative', zIndex: 3,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 18 }}>
          <PrecisionSlider label="Depth" value={params.depth} min={1} max={16} step={1} precision={0} onChange={v => setParam('depth', v)} />
          <PrecisionSlider label="Rotation" value={params.rotation} min={-180} max={180} step={1} precision={0} unit="°" onChange={v => setParam('rotation', v)} />
          <PrecisionSlider label="Opacity" value={params.opacity} min={0} max={1} onChange={v => setParam('opacity', v)} />
          <PrecisionSlider label="Speed" value={params.speed} min={0.1} max={3} onChange={v => setParam('speed', v)} />
        </div>
      </div>

      {/* Shutter row */}
      <div style={{
        background: COLORS.bg, padding: '14px 24px 30px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: `0.5px solid ${COLORS.line}`, position: 'relative', zIndex: 3,
      }}>
        {/* Gallery thumb */}
        <button onClick={onOpenGallery} style={{
          width: 46, height: 46, border: `0.5px solid ${COLORS.lineStrong}`,
          background: lastThumb ? `url(${lastThumb}) center/cover` : 'rgba(255,255,255,0.05)',
          padding: 0, cursor: 'pointer', color: COLORS.dim,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!lastThumb && <Icon name="gallery" size={18} color={COLORS.dim} stroke={1.3} />}
        </button>

        {/* Shutter cluster */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={onToggleRecord} style={{
            width: 44, height: 44, border: `0.5px solid ${COLORS.lineStrong}`,
            background: 'transparent', color: recording ? COLORS.rec : COLORS.fg,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {recording ? <div style={{ width: 14, height: 14, background: COLORS.rec }} /> : <Icon name="video" size={18} />}
          </button>

          <button onClick={onShutter} style={{
            width: 72, height: 72, borderRadius: '50%', padding: 0,
            border: `1px solid ${COLORS.fg}`, background: 'transparent',
            cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: COLORS.fg,
              transition: 'transform 0.1s', transform: 'scale(1)',
            }} />
          </button>

          <button onClick={onOpenPanel} style={{
            width: 44, height: 44, border: `0.5px solid ${COLORS.lineStrong}`,
            background: 'transparent', color: COLORS.fg, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="settings" size={18} />
          </button>
        </div>

        {/* Flip cam */}
        <button onClick={onFlipCam} style={{
          width: 46, height: 46, border: `0.5px solid ${COLORS.lineStrong}`,
          background: 'transparent', color: COLORS.fg, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="flip" size={18} />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { CaptureView });

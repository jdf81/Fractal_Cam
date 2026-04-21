// screens.jsx — individual screens: permission, onboarding, gallery, effect picker, control panel

const { useState: scUseState, useEffect: scUseEffect, useRef: scUseRef } = React;

// ─── PERMISSION ───────────────────────────────────────
function PermissionScreen({ onGrant, onDecline }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: COLORS.bg,
      color: COLORS.fg, display: 'flex', flexDirection: 'column',
      padding: '90px 28px 40px', zIndex: 100,
      fontFamily: FONT_UI,
    }}>
      {/* viewfinder mark */}
      <div style={{
        width: 96, height: 96, margin: '0 auto 32px', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CornerBrackets inset={0} size={22} color="rgba(255,255,255,0.6)" />
        <div style={{
          width: 44, height: 44, border: `1px solid ${COLORS.accent}`,
          borderRadius: '50%', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 10, border: `1px solid ${COLORS.accent}`,
            borderRadius: '50%', opacity: 0.5,
          }} />
        </div>
      </div>

      <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 2, color: COLORS.dim, textAlign: 'center', marginBottom: 16 }}>
        RECUR — 00.1
      </div>
      <h1 style={{
        fontSize: 28, fontWeight: 500, lineHeight: 1.15, margin: '0 0 14px',
        textAlign: 'center', letterSpacing: -0.4, textWrap: 'balance',
      }}>
        Camera access, please.
      </h1>
      <p style={{
        fontSize: 15, lineHeight: 1.5, color: COLORS.dim, textAlign: 'center',
        margin: '0 auto 40px', maxWidth: 280, textWrap: 'pretty',
      }}>
        Recur feeds your live camera through a chain of recursive operators. Nothing leaves the device.
      </p>

      <div style={{
        border: `0.5px solid ${COLORS.line}`, padding: 16,
        display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32,
      }}>
        {[
          ['LIVE CAMERA', 'Read-only feed, on-device'],
          ['NO NETWORK', 'Frames never transmitted'],
          ['MICROPHONE', 'Only while recording video'],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, color: COLORS.dim }}>{k}</span>
            <span style={{ fontSize: 12, color: COLORS.fg }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={onGrant} style={{
        width: '100%', padding: '16px', background: COLORS.fg, color: COLORS.bg,
        border: 'none', fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5,
        textTransform: 'uppercase', cursor: 'pointer',
      }}>
        Enable camera
      </button>
      <button onClick={onDecline} style={{
        width: '100%', padding: '14px', background: 'transparent', color: COLORS.dim,
        border: 'none', fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.2,
        textTransform: 'uppercase', cursor: 'pointer', marginTop: 8,
      }}>
        Use demo feed
      </button>
    </div>
  );
}

// ─── ONBOARDING (3 panels) ─────────────────────────────
function OnboardingScreen({ onDone }) {
  const [i, setI] = scUseState(0);
  const panels = [
    {
      k: '00',
      h: 'Feedback is the medium.',
      p: 'Each frame becomes the input to the next. Six operators. Infinite drift.',
      mark: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, width: 180, height: 180 }}>
          {Array.from({ length: 9 }).map((_, k) => (
            <div key={k} style={{
              background: `oklch(${0.2 + k * 0.06} 0.02 70)`,
              border: `0.5px solid ${COLORS.line}`,
            }} />
          ))}
        </div>
      ),
    },
    {
      k: '01',
      h: 'Live-tune, don\u2019t retouch.',
      p: 'Depth, rotation, opacity, speed. All controls are real-time — set them while the image breathes.',
      mark: (
        <div style={{ position: 'relative', width: 200, height: 180 }}>
          {[0,1,2,3].map(k => (
            <div key={k} style={{
              position: 'absolute', inset: k * 14,
              border: `1px solid ${k === 0 ? COLORS.accent : 'rgba(255,255,255,' + (0.4 - k * 0.08) + ')'}`,
              transform: `rotate(${k * 6}deg)`, transformOrigin: 'center',
            }} />
          ))}
        </div>
      ),
    },
    {
      k: '02',
      h: 'Capture what surprises you.',
      p: 'Shutter for stills. Hold for video. Save any arrangement as a preset.',
      mark: (
        <div style={{ width: 180, height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CornerBrackets inset={0} size={22} color="rgba(255,255,255,0.4)" />
          <div style={{
            width: 68, height: 68, borderRadius: '50%', border: `1px solid ${COLORS.fg}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: COLORS.fg }} />
          </div>
        </div>
      ),
    },
  ];
  const p = panels[i];

  return (
    <div style={{
      position: 'absolute', inset: 0, background: COLORS.bg,
      color: COLORS.fg, display: 'flex', flexDirection: 'column',
      padding: '80px 28px 40px', zIndex: 99, fontFamily: FONT_UI,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: COLORS.dim }}>
        <span>RECUR / INTRO / {p.k}</span>
        <button onClick={onDone} style={{ background: 'none', border: 'none', color: COLORS.dim, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, cursor: 'pointer' }}>SKIP →</button>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {p.mark}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {panels.map((_, k) => (
          <div key={k} style={{
            flex: 1, height: 2,
            background: k <= i ? COLORS.fg : 'rgba(255,255,255,0.15)',
          }} />
        ))}
      </div>

      <h1 style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.1, margin: '0 0 12px', letterSpacing: -0.5, textWrap: 'balance' }}>
        {p.h}
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: COLORS.dim, margin: '0 0 32px', textWrap: 'pretty' }}>
        {p.p}
      </p>

      <button onClick={() => i < panels.length - 1 ? setI(i + 1) : onDone()} style={{
        width: '100%', padding: '16px', background: COLORS.fg, color: COLORS.bg,
        border: 'none', fontFamily: FONT_MONO, fontSize: 12, letterSpacing: 1.5,
        textTransform: 'uppercase', cursor: 'pointer',
      }}>
        {i < panels.length - 1 ? 'Next →' : 'Begin'}
      </button>
    </div>
  );
}

// ─── EFFECT PICKER SHEET ─────────────────────────────
function EffectPickerSheet({ open, current, onPick, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80, pointerEvents: open ? 'auto' : 'none',
    }}>
      {/* backdrop */}
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
        opacity: open ? 1 : 0, transition: 'opacity 0.24s ease',
      }} />
      {/* sheet */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: COLORS.bgElev, borderTop: `0.5px solid ${COLORS.line}`,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
        padding: '14px 20px 36px',
      }}>
        <div style={{
          width: 40, height: 4, background: 'rgba(255,255,255,0.2)',
          borderRadius: 2, margin: '0 auto 18px',
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: COLORS.dim }}>
            SELECT OPERATOR · 6
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.dim, cursor: 'pointer' }}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {EFFECTS.map((e, idx) => {
            const sel = current === e.id;
            return (
              <button key={e.id} onClick={() => { onPick(e.id); onClose(); }}
                style={{
                  padding: 14, textAlign: 'left',
                  background: sel ? COLORS.accentDim : 'rgba(255,255,255,0.03)',
                  border: `0.5px solid ${sel ? COLORS.accent : COLORS.line}`,
                  color: COLORS.fg, cursor: 'pointer',
                  fontFamily: FONT_UI, position: 'relative',
                  display: 'flex', flexDirection: 'column', gap: 10, minHeight: 108,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: sel ? COLORS.accent : COLORS.dim, letterSpacing: 1 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Icon name={EFFECT_ICONS[e.id]} size={18} color={sel ? COLORS.accent : COLORS.dim} stroke={1.3} />
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1, color: COLORS.fg, marginBottom: 3 }}>
                    {e.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.dim, lineHeight: 1.35 }}>
                    {e.hint}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── CONTROL PANEL SHEET ─────────────────────────────
function ControlPanelSheet({ open, params, onParam, onClose, effect, onSavePreset, presets, onLoadPreset, onDeletePreset }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 80, pointerEvents: open ? 'auto' : 'none',
    }}>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
        opacity: open ? 1 : 0, transition: 'opacity 0.24s ease',
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: COLORS.bgElev, borderTop: `0.5px solid ${COLORS.line}`,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
        padding: '14px 20px 36px',
        maxHeight: '78%', overflowY: 'auto',
      }}>
        <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '0 auto 18px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: COLORS.dim }}>
            PARAMETERS · {effect.name}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.dim, cursor: 'pointer' }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: COLORS.dim, marginBottom: 14 }}>{effect.label}</div>

        <PrecisionSlider label="Depth / Count" value={params.depth} min={1} max={16} step={1} precision={0} onChange={v => onParam('depth', v)} />
        <PrecisionSlider label="Rotation" value={params.rotation} min={-180} max={180} step={1} precision={0} unit="°" onChange={v => onParam('rotation', v)} />
        <PrecisionSlider label="Scale" value={params.scale} min={0.4} max={1.6} onChange={v => onParam('scale', v)} />
        <PrecisionSlider label="Opacity" value={params.opacity} min={0} max={1} onChange={v => onParam('opacity', v)} />
        <PrecisionSlider label="Feedback Speed" value={params.speed} min={0.1} max={3} onChange={v => onParam('speed', v)} />

        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.8, color: COLORS.dim, textTransform: 'uppercase', marginBottom: 8 }}>
            Blend Mode
          </div>
          <Segmented
            value={params.blend}
            onChange={v => onParam('blend', v)}
            options={[
              { value: 'source-over', label: 'Over' },
              { value: 'lighter', label: 'Add' },
              { value: 'screen', label: 'Screen' },
              { value: 'multiply', label: 'Mul' },
              { value: 'difference', label: 'Diff' },
            ]}
          />
        </div>

        {/* Presets */}
        <div style={{ marginTop: 22, borderTop: `0.5px solid ${COLORS.line}`, paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 0.8, color: COLORS.dim, textTransform: 'uppercase' }}>
              Presets · {presets.length}
            </span>
            <button onClick={onSavePreset} style={{
              padding: '6px 10px', border: `0.5px solid ${COLORS.line}`,
              background: 'transparent', color: COLORS.fg,
              fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Icon name="plus" size={12} /> SAVE CURRENT
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {presets.length === 0 && (
              <div style={{ padding: 14, border: `0.5px dashed ${COLORS.line}`, color: COLORS.dimmer, fontSize: 11, textAlign: 'center' }}>
                No presets saved yet.
              </div>
            )}
            {presets.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', padding: '10px 12px',
                border: `0.5px solid ${COLORS.line}`, background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: COLORS.fg }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: COLORS.dim }}>
                    {EFFECTS.find(e => e.id === p.effect)?.name} · D{p.params.depth} · R{Math.round(p.params.rotation)}°
                  </div>
                </div>
                <button onClick={() => onLoadPreset(p)} style={{ background: 'none', border: 'none', color: COLORS.accent, fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, cursor: 'pointer', padding: 6 }}>LOAD</button>
                <button onClick={() => onDeletePreset(i)} style={{ background: 'none', border: 'none', color: COLORS.dimmer, cursor: 'pointer', padding: 6 }}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY ────────────────────────────────────────
function GalleryScreen({ open, items, onClose, onDelete }) {
  const [sel, setSel] = scUseState(null);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: COLORS.bg, zIndex: 90,
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)',
      display: 'flex', flexDirection: 'column', fontFamily: FONT_UI,
    }}>
      <div style={{
        padding: '62px 20px 14px', display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: `0.5px solid ${COLORS.line}`,
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.fg, cursor: 'pointer', padding: 0 }}>
          <Icon name="arrow-left" size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: COLORS.dim }}>ROLL</div>
          <div style={{ fontSize: 18, color: COLORS.fg, letterSpacing: -0.2 }}>Captures · {items.length}</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: COLORS.dim, gap: 10, padding: 40, textAlign: 'center' }}>
          <Icon name="gallery" size={32} color={COLORS.dimmer} stroke={1.2} />
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 1.2 }}>EMPTY ROLL</div>
          <div style={{ fontSize: 12, color: COLORS.dimmer, maxWidth: 220 }}>
            Tap the shutter to capture a still. Hold to record.
          </div>
        </div>
      ) : (
        <div style={{
          flex: 1, overflowY: 'auto', padding: 4,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2,
        }}>
          {items.map((it, i) => (
            <button key={i} onClick={() => setSel(i)} style={{
              aspectRatio: '1', border: 'none', padding: 0, cursor: 'pointer',
              background: '#000', position: 'relative', overflow: 'hidden',
            }}>
              <img src={it.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {it.type === 'video' && (
                <div style={{
                  position: 'absolute', top: 6, right: 6,
                  fontFamily: FONT_MONO, fontSize: 9, color: COLORS.fg,
                  background: 'rgba(0,0,0,0.6)', padding: '2px 4px', letterSpacing: 0.5,
                }}>VID</div>
              )}
              <div style={{
                position: 'absolute', left: 4, bottom: 4,
                fontFamily: FONT_MONO, fontSize: 8, color: 'rgba(255,255,255,0.8)',
                letterSpacing: 1, textShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}>{it.effect?.toUpperCase()}</div>
            </button>
          ))}
        </div>
      )}

      {/* Detail overlay */}
      {sel !== null && items[sel] && (
        <div onClick={() => setSel(null)} style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 5,
          display: 'flex', flexDirection: 'column', padding: '60px 16px 40px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: COLORS.fg, marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: COLORS.dim, letterSpacing: 1 }}>{items[sel].effect?.toUpperCase()}</div>
              <div style={{ fontSize: 13 }}>{new Date(items[sel].ts).toLocaleTimeString()}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(sel); setSel(null); }} style={{ background: 'none', border: `0.5px solid ${COLORS.line}`, color: COLORS.fg, padding: '6px 10px', fontFamily: FONT_MONO, fontSize: 10, letterSpacing: 1, cursor: 'pointer' }}>DELETE</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {items[sel].type === 'video'
              ? <video src={items[sel].url} controls autoPlay loop style={{ maxWidth: '100%', maxHeight: '100%' }} />
              : <img src={items[sel].url} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            }
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { PermissionScreen, OnboardingScreen, EffectPickerSheet, ControlPanelSheet, GalleryScreen });

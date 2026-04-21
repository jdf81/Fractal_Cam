// app.jsx — main app: state, camera stream, render loop, capture/record, presets

const { useState: apUseState, useEffect: apUseEffect, useRef: apUseRef, useCallback: apUseCallback } = React;

const DEFAULT_PARAMS = {
  depth: 6,
  rotation: 12,
  scale: 0.92,
  opacity: 0.72,
  speed: 1,
  blend: 'source-over',
};

function App() {
  const [route, setRoute] = apUseState('permission'); // permission -> onboarding -> capture
  const [effect, setEffect] = apUseState('kaleido');
  const [params, setParams] = apUseState(DEFAULT_PARAMS);
  const [pickerOpen, setPickerOpen] = apUseState(false);
  const [panelOpen, setPanelOpen] = apUseState(false);
  const [galleryOpen, setGalleryOpen] = apUseState(false);
  const [facing, setFacing] = apUseState('user');
  const [usingDemo, setUsingDemo] = apUseState(false);
  const [captures, setCaptures] = apUseState([]);
  const [presets, setPresets] = apUseState([]);
  const [recording, setRecording] = apUseState(false);
  const [recStart, setRecStart] = apUseState(0);
  const [lastThumb, setLastThumb] = apUseState(null);

  const videoRef = apUseRef(null);
  const canvasRef = apUseRef(null);
  const streamRef = apUseRef(null);
  const rafRef = apUseRef(null);
  const perRef = apUseRef({}); // per-effect persistent state
  const recorderRef = apUseRef(null);
  const recChunksRef = apUseRef([]);

  const setParam = (k, v) => setParams(p => ({ ...p, [k]: v }));

  // Reset persistent state when effect changes
  apUseEffect(() => { perRef.current = {}; }, [effect]);

  // Load persisted presets
  apUseEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recur.presets') || '[]');
      if (Array.isArray(saved)) setPresets(saved);
    } catch (e) {}
  }, []);

  const savePresets = (arr) => {
    setPresets(arr);
    try { localStorage.setItem('recur.presets', JSON.stringify(arr)); } catch (e) {}
  };

  // Start / restart camera
  const startCamera = apUseCallback(async (which) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: which, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setUsingDemo(false);
    } catch (err) {
      // fall back to demo gradient feed
      setUsingDemo(true);
      startDemoFeed();
    }
  }, []);

  const startDemoFeed = apUseCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      try { videoRef.current.srcObject.getTracks?.().forEach(t => t.stop()); } catch (e) {}
    }
    // Build an animated canvas, capture its stream as the "video"
    const c = document.createElement('canvas');
    c.width = 640; c.height = 1280;
    const cx = c.getContext('2d');
    let t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      const g = cx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, `oklch(0.5 0.18 ${(t * 40) % 360})`);
      g.addColorStop(1, `oklch(0.3 0.2 ${(t * 40 + 120) % 360})`);
      cx.fillStyle = g;
      cx.fillRect(0, 0, c.width, c.height);
      // moving shapes
      for (let i = 0; i < 5; i++) {
        cx.fillStyle = `oklch(0.85 0.18 ${(t * 60 + i * 70) % 360} / 0.7)`;
        cx.beginPath();
        cx.arc(
          c.width / 2 + Math.cos(t + i) * 180,
          c.height / 2 + Math.sin(t * 0.8 + i) * 340,
          40 + 20 * Math.sin(t * 2 + i),
          0, Math.PI * 2
        );
        cx.fill();
      }
      // text marker
      cx.fillStyle = 'rgba(255,255,255,0.85)';
      cx.font = 'bold 32px monospace';
      cx.fillText('DEMO FEED', 30, 60);
      cx.font = '16px monospace';
      cx.fillText(`T+${t.toFixed(1)}s`, 30, 90);
      requestAnimationFrame(tick);
    };
    tick();
    const s = c.captureStream(30);
    if (videoRef.current) {
      videoRef.current.srcObject = s;
      videoRef.current.play().catch(() => {});
    }
    streamRef.current = s;
  }, []);

  // Render loop
  apUseEffect(() => {
    if (route !== 'capture') return;
    const v = videoRef.current;
    const canvas = canvasRef.current;
    if (!v || !canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const r = RENDERERS[effect];
      if (r && v.videoWidth) {
        try { r(ctx, v, params, perRef.current); }
        catch (e) { /* ignore per-frame errors */ }
      } else {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [route, effect, params]);

  // Kick off camera when route enters capture
  apUseEffect(() => {
    if (route === 'capture') startCamera(facing);
    return () => {
      if (route !== 'capture' && streamRef.current) {
        streamRef.current.getTracks?.().forEach(t => t.stop());
      }
    };
  }, [route, facing, startCamera]);

  // Handlers
  const handleGrant = async () => { setRoute('onboarding'); };
  const handleDecline = () => { setUsingDemo(true); setRoute('onboarding'); };

  const handleShutter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const cap = { type: 'photo', url, effect, params: { ...params }, ts: Date.now() };
    setCaptures(cs => [cap, ...cs]);
    setLastThumb(url);
    // shutter flash
    flashShutter();
  };

  const handleToggleRecord = () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas || !canvas.captureStream) return;
    try {
      const stream = canvas.captureStream(30);
      const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      recChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) recChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const cap = { type: 'video', url, effect, params: { ...params }, ts: Date.now() };
        setCaptures(cs => [cap, ...cs]);
        // capture a still thumbnail for the gallery button
        setLastThumb(canvas.toDataURL('image/jpeg', 0.6));
        setRecording(false);
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setRecStart(Date.now());
    } catch (err) {
      console.warn('record failed', err);
    }
  };

  const handleFlip = () => setFacing(f => f === 'user' ? 'environment' : 'user');

  const handleSavePreset = () => {
    const name = `PRESET ${String(presets.length + 1).padStart(2, '0')}`;
    savePresets([{ name, effect, params: { ...params }, ts: Date.now() }, ...presets]);
  };
  const handleLoadPreset = (p) => {
    setEffect(p.effect);
    setParams(p.params);
    setPanelOpen(false);
  };
  const handleDeletePreset = (i) => {
    savePresets(presets.filter((_, k) => k !== i));
  };

  const handleDeleteCapture = (i) => {
    setCaptures(cs => cs.filter((_, k) => k !== i));
  };

  // Shutter flash overlay
  const flashRef = apUseRef(null);
  const flashShutter = () => {
    if (!flashRef.current) return;
    const el = flashRef.current;
    el.style.transition = 'none';
    el.style.opacity = '0.9';
    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s ease';
      el.style.opacity = '0';
    });
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000', overflow: 'hidden' }}>
      <CaptureView
        videoRef={videoRef}
        canvasRef={canvasRef}
        effect={effect}
        setEffect={setEffect}
        params={params}
        setParam={setParam}
        onOpenPicker={() => setPickerOpen(true)}
        onOpenPanel={() => setPanelOpen(true)}
        onOpenGallery={() => setGalleryOpen(true)}
        lastThumb={lastThumb}
        onShutter={handleShutter}
        onToggleRecord={handleToggleRecord}
        recording={recording}
        recStart={recStart}
        onFlipCam={handleFlip}
        facing={facing}
        usingDemo={usingDemo}
      />

      {/* Shutter flash */}
      <div ref={flashRef} style={{
        position: 'absolute', inset: 0, background: '#fff', opacity: 0,
        pointerEvents: 'none', zIndex: 200,
      }} />

      <EffectPickerSheet
        open={pickerOpen}
        current={effect}
        onPick={setEffect}
        onClose={() => setPickerOpen(false)}
      />

      <ControlPanelSheet
        open={panelOpen}
        params={params}
        onParam={setParam}
        onClose={() => setPanelOpen(false)}
        effect={EFFECTS.find(e => e.id === effect)}
        onSavePreset={handleSavePreset}
        presets={presets}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
      />

      <GalleryScreen
        open={galleryOpen}
        items={captures}
        onClose={() => setGalleryOpen(false)}
        onDelete={handleDeleteCapture}
      />

      {route === 'permission' && (
        <PermissionScreen onGrant={handleGrant} onDecline={handleDecline} />
      )}
      {route === 'onboarding' && (
        <OnboardingScreen onDone={() => setRoute('capture')} />
      )}
    </div>
  );
}

Object.assign(window, { App });

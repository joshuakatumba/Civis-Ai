import { useEffect, useRef, useState } from "react";
function useMic(onText, notify) {
  const [on, setOn] = useState(false);
  const [text, setText] = useState("");
  const bars = useRef([]);
  const r = useRef({ heard: "" });

  const stop = (keep) => {
    const s = r.current;
    cancelAnimationFrame(s.raf);
    if (s.rec) { try { s.rec.stop(); } catch (e) { /* ignore */ } }
    if (s.stream) s.stream.getTracks().forEach((t) => t.stop());
    if (s.ac) { try { s.ac.close(); } catch (e) { /* ignore */ } }
    if (keep && s.heard) onText(s.heard);
    r.current = { heard: "" };
    setText("");
    setOn(false);
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return notify("Microphone is not supported in this browser");
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch (e) { return notify("Microphone access was blocked. Allow it in your browser settings."); }
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.resume) ac.resume();
    const an = ac.createAnalyser();
    an.fftSize = 64;
    ac.createMediaStreamSource(stream).connect(an);
    const d = new Uint8Array(an.frequencyBinCount);
    const s = { heard: "", stream, ac };
    const loop = (t) => {
      an.getByteFrequencyData(d);
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${Math.min(1, 0.14 + (d[i % d.length] / 255) * 0.9 + 0.08 * Math.abs(Math.sin(t / 180 + i)))})`;
      });
      s.raf = requestAnimationFrame(loop);
    };
    s.raf = requestAnimationFrame(loop);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        const rec = new SR();
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (e) => {
          let x = "";
          for (let i = 0; i < e.results.length; i++) x += e.results[i][0].transcript;
          s.heard = x;
          setText(x);
        };
        rec.onerror = () => {};
        rec.start();
        s.rec = rec;
      } catch (e) { /* ignore */ }
    }
    r.current = s;
    setOn(true);
  };

  useEffect(() => () => stop(false), []); // eslint-disable-line react-hooks/exhaustive-deps
  return { on, text, bars, start, stop };
}

export default useMic;

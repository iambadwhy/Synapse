"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CaptureType } from "@/lib/types";
import {
  Type,
  Link2,
  ImageIcon,
  Mic,
  Send,
  X,
  MicOff,
  Upload,
} from "lucide-react";

type VoiceState = "idle" | "recording" | "transcribing" | "done";

const MOCK_TRANSCRIPTIONS = [
  "Client wants the brand refresh locked before Q2 kickoff. The pastel palette isn't working — needs more edge and contrast.",
  "Thesis note: kinetic type creates a cognitive rhythm that static typography simply cannot achieve. Use this as the core argument.",
  "Record the voiceover for the thesis trailer this weekend — Saturday morning light in the studio is perfect.",
];

interface CaptureBarProps {
  onCapture: (
    content: string,
    type: CaptureType,
    extra?: { linkUrl?: string; linkDomain?: string; imagePreview?: string }
  ) => void;
}

const MODES: { id: CaptureType; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: "text", label: "Text", Icon: Type },
  { id: "link", label: "Link", Icon: Link2 },
  { id: "image", label: "Image", Icon: ImageIcon },
  { id: "voice", label: "Voice", Icon: Mic },
];

function isValidUrl(s: string) {
  return /^(https?:\/\/|www\.)/.test(s.trim()) || /\.[a-z]{2,}\//.test(s.trim());
}

function getDomain(url: string) {
  try {
    const u = url.startsWith("http") ? url : `https://${url}`;
    return new URL(u).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function CaptureBar({ onCapture }: CaptureBarProps) {
  const [mode, setMode] = useState<CaptureType>("text");
  const [textValue, setTextValue] = useState("");
  const [linkValue, setLinkValue] = useState("");
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [voiceText, setVoiceText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus textarea when switching to text
  useEffect(() => {
    if (mode === "text") textareaRef.current?.focus();
  }, [mode]);

  const resetAll = useCallback(() => {
    setTextValue("");
    setLinkValue("");
    setVoiceState("idle");
    setVoiceText("");
    setImagePreview(null);
    setImageName("");
    setIsDragging(false);
  }, []);

  // ── Submit logic ──────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (mode === "text" && textValue.trim()) {
      onCapture(textValue.trim(), "text");
      setTextValue("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1200);
    } else if (mode === "link" && linkValue.trim()) {
      const domain = getDomain(linkValue);
      onCapture(linkValue.trim(), "link", { linkUrl: linkValue.trim(), linkDomain: domain });
      setLinkValue("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1200);
    } else if (mode === "image" && imagePreview) {
      onCapture(imageName || "Image capture", "image", { imagePreview: imagePreview });
      resetAll();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1200);
    } else if (mode === "voice" && voiceState === "done" && voiceText.trim()) {
      onCapture(voiceText.trim(), "voice");
      resetAll();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 1200);
    }
  }, [mode, textValue, linkValue, imagePreview, imageName, voiceState, voiceText, onCapture, resetAll]);

  // ── Text: Enter to submit ─────────────────────────────
  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ── Voice recording simulation ────────────────────────
  const startRecording = () => {
    setVoiceState("recording");
    recordingTimerRef.current = setTimeout(() => {
      setVoiceState("transcribing");
      setTimeout(() => {
        const pick = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
        setVoiceText(pick);
        setVoiceState("done");
      }, 1500);
    }, 3000);
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    setVoiceState("transcribing");
    setTimeout(() => {
      const pick = MOCK_TRANSCRIPTIONS[Math.floor(Math.random() * MOCK_TRANSCRIPTIONS.length)];
      setVoiceText(pick);
      setVoiceState("done");
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearTimeout(recordingTimerRef.current);
    };
  }, []);

  // ── Image drop / file input ───────────────────────────
  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── Can submit? ───────────────────────────────────────
  const canSubmit =
    (mode === "text" && textValue.trim().length > 0) ||
    (mode === "link" && linkValue.trim().length > 2) ||
    (mode === "image" && imagePreview !== null) ||
    (mode === "voice" && voiceState === "done" && voiceText.trim().length > 0);

  const linkValid = linkValue.trim().length > 2 && isValidUrl(linkValue);

  return (
    <div
      className="mx-4 mt-4 mb-2 rounded-2xl overflow-hidden"
      style={{
        background: "var(--syn-surface)",
        border: "1px solid var(--syn-border)",
      }}
    >
      {/* Mode tabs */}
      <div
        className="flex items-center gap-0 px-3 pt-3 pb-0"
        style={{ borderBottom: "1px solid var(--syn-border-subtle)" }}
      >
        {MODES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => { setMode(id); resetAll(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-all cursor-pointer relative"
            style={
              mode === id
                ? { color: "var(--syn-indigo)", background: "rgba(99,102,241,0.08)" }
                : { color: "var(--syn-slate)" }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
            {mode === id && (
              <span
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ background: "var(--syn-indigo)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3">
        {/* ── TEXT ─── */}
        {mode === "text" && (
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              onKeyDown={handleTextKeyDown}
              placeholder="Capture a thought, idea, or note…"
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--syn-slate)] text-[var(--syn-dim)] leading-relaxed"
            />
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              aria-label="Capture text"
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: canSubmit ? "var(--syn-indigo)" : "rgba(255,255,255,0.05)" }}
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* ── LINK ─── */}
        {mode === "link" && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <Link2 className="w-4 h-4 shrink-0" style={{ color: "var(--syn-slate)" }} />
              <input
                type="url"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Paste a URL…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--syn-slate)] text-[var(--syn-dim)]"
                autoFocus
              />
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                aria-label="Capture link"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
                style={{ background: canSubmit ? "var(--syn-indigo)" : "rgba(255,255,255,0.05)" }}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            {/* Link preview */}
            {linkValid && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
              >
                <div
                  className="w-5 h-5 rounded flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                  style={{ background: "var(--syn-indigo)" }}
                >
                  {getDomain(linkValue)[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--syn-dim)] truncate">{getDomain(linkValue)}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── IMAGE ─── */}
        {mode === "image" && (
          <div className="flex flex-col gap-2">
            {!imagePreview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 cursor-pointer transition-all"
                style={{
                  border: `1.5px dashed ${isDragging ? "var(--syn-indigo)" : "rgba(255,255,255,0.12)"}`,
                  background: isDragging ? "rgba(99,102,241,0.06)" : "transparent",
                }}
              >
                <Upload className="w-5 h-5" style={{ color: "var(--syn-slate)" }} />
                <p className="text-xs" style={{ color: "var(--syn-slate)" }}>
                  Drop an image or <span style={{ color: "var(--syn-indigo)" }}>browse</span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-14 h-14 rounded-lg object-cover shrink-0"
                  style={{ border: "1px solid var(--syn-border)" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--syn-dim)] truncate">{imageName}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: "var(--syn-slate)" }}>
                    Ready to capture
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={resetAll}
                    aria-label="Remove image"
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--syn-slate)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    aria-label="Capture image"
                    className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: "var(--syn-indigo)" }}
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── VOICE ─── */}
        {mode === "voice" && (
          <div className="flex flex-col gap-3">
            {voiceState === "idle" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <button
                  onClick={startRecording}
                  aria-label="Start voice recording"
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1.5px solid var(--syn-indigo)" }}
                >
                  <Mic className="w-5 h-5" style={{ color: "var(--syn-indigo)" }} />
                </button>
                <p className="text-xs" style={{ color: "var(--syn-slate)" }}>
                  Tap to record
                </p>
              </div>
            )}

            {voiceState === "recording" && (
              <div className="flex flex-col items-center gap-3 py-2">
                {/* Waveform */}
                <div className="flex items-end gap-1 h-8">
                  {[14, 22, 30, 24, 18, 28, 16].map((h, i) => (
                    <div
                      key={i}
                      className="wave-bar w-1.5 rounded-full"
                      style={{ height: `${h}px`, background: "#EF4444" }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs text-red-400 font-mono">Recording…</span>
                </div>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <MicOff className="w-3 h-3" /> Stop
                </button>
              </div>
            )}

            {voiceState === "transcribing" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin"
                  style={{ borderColor: "var(--syn-indigo)", borderTopColor: "transparent" }}
                />
                <p className="text-xs font-mono" style={{ color: "var(--syn-indigo)" }}>
                  Transcribing…
                </p>
              </div>
            )}

            {voiceState === "done" && (
              <div className="flex flex-col gap-2">
                <div
                  className="px-3 py-2 rounded-lg"
                  style={{ background: "rgba(99,102,241,0.07)", border: "1px solid rgba(99,102,241,0.15)" }}
                >
                  <textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent text-sm outline-none resize-none text-[var(--syn-dim)] leading-relaxed"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={resetAll}
                    className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.05)", color: "var(--syn-slate)" }}
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    style={{ background: "var(--syn-indigo)", color: "#fff" }}
                  >
                    <Send className="w-3 h-3" /> Capture
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation flash */}
      {submitted && (
        <div
          className="px-3 py-2 text-xs font-mono text-center transition-all"
          style={{ background: "rgba(16,185,129,0.1)", color: "var(--syn-mint)", borderTop: "1px solid rgba(16,185,129,0.15)" }}
        >
          ✓ Captured — clustering…
        </div>
      )}

      {/* Footer hint */}
      {!submitted && mode === "text" && (
        <div
          className="px-3 pb-2 text-[10px] font-mono"
          style={{ color: "var(--syn-slate)" }}
        >
          ↵ Enter to capture · Shift+Enter for newline
        </div>
      )}
    </div>
  );
}

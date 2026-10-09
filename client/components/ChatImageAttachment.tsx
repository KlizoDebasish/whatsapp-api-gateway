"use client";

import React, { useState } from "react";
import { Sparkles, Maximize2, Download, RefreshCw, X, ExternalLink, Image as ImageIcon } from "lucide-react";

interface ChatImageAttachmentProps {
  imageUrl: string;
  caption?: string;
  alt?: string;
  isUser?: boolean;
}

export function ChatImageAttachment({
  imageUrl,
  caption,
  alt = "AI Generated Visual",
  isUser = false
}: ChatImageAttachmentProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageError = () => {
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount((c) => c + 1);
      }, 1500);
    } else {
      setHasError(true);
    }
  };

  // Download handler
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `messageapi-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <>
      <div className="space-y-2 mt-1">
        {/* Main 1024x1024 Aspect-Square Media Container */}
        <div
          onClick={() => isLoaded && setIsLightboxOpen(true)}
          className={`relative w-full aspect-square max-w-[320px] sm:max-w-[360px] rounded-2xl overflow-hidden shadow-md border ${
            isUser ? "border-emerald-300/60" : "border-slate-200"
          } bg-slate-900 select-none group ${isLoaded ? "cursor-zoom-in" : "cursor-wait"}`}
        >
          {/* SKELETON PRELOADER: Same exact height and width (aspect-square) */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center z-10 overflow-hidden">
              {/* Shimmer gradient background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 animate-pulse" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_70%)] animate-pulse" />

              {/* Centered Spinner & Visual Branding */}
              <div className="relative z-20 flex flex-col items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
                  <Sparkles className="w-6 h-6 text-emerald-400 absolute animate-pulse" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-100 flex items-center justify-center gap-1.5">
                    <span>Synthesizing Visual</span>
                    <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60">
                      1024×1024
                    </span>
                  </p>
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Generating high-res photorealistic visual...
                  </p>
                </div>

                {/* Shimmer mini progress bar */}
                <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1 border border-slate-700/60">
                  <div className="h-full bg-gradient-to-r from-teal-400 via-emerald-300 to-emerald-500 rounded-full animate-[shimmer_1.8s_infinite] w-3/4" />
                </div>
              </div>

              {/* Bottom engine badge */}
              <div className="absolute bottom-3 text-[9px] text-slate-500 font-mono flex items-center gap-1">
                <span>⚡ Pollinations AI Engine</span>
              </div>
            </div>
          )}

          {/* Error fallback state */}
          {hasError && (
            <div className="absolute inset-0 w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2">
              <ImageIcon className="w-8 h-8 text-rose-400" />
              <p className="text-xs font-semibold text-rose-300">Could not load preview</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1 font-medium mt-1"
              >
                <span>Open direct image link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Actual 1024x1024 image element */}
          <img
            key={`${imageUrl}_${retryCount}`}
            src={imageUrl}
            alt={alt}
            loading="lazy"
            onLoad={() => {
              setIsLoaded(true);
              setHasError(false);
            }}
            onError={handleImageError}
            className={`w-full h-full object-cover transition-all duration-700 ${
              isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
          />

          {/* Loaded overlay toolbar */}
          {isLoaded && !hasError && (
            <>
              {/* Resolution pill at top */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/90 border border-white/10 shadow-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                <span>AI Visual • 1024×1024</span>
              </div>

              {/* Action buttons overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-between p-3">
                <div className="flex items-center gap-1 text-[11px] font-medium text-white/90">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Click to expand</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 transition-colors shadow-xs"
                  title="Download High-Res Image"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
        >
          {/* Lightbox Header Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl flex items-center justify-between pb-3 px-2 text-white border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold">1024×1024 High-Res AI Visual</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Centered High-Resolution Image View */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[82vh] p-2 flex items-center justify-center relative overflow-hidden"
          >
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Lightbox Footer Caption */}
          {caption && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl text-center text-xs text-slate-300 bg-white/10 backdrop-blur-md rounded-xl p-2.5 mt-2 border border-white/10"
            >
              <p className="line-clamp-2">{caption}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

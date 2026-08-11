import { Smartphone, Share, MoreVertical, PlusSquare, Download, CheckCircle2, X } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallClick: () => void;
}

export function InstallAppModal({ isOpen, onClose, deferredPrompt, onInstallClick }: InstallAppModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 rounded-full p-1 transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-2xl bg-blue-600 p-3 text-white">
            <Smartphone size={22} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Download App on Phone</h2>
            <p className="text-xs text-slate-500">Install RECONAI as a native Progressive Web App</p>
          </div>
        </div>

        {deferredPrompt ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-slate-600 leading-relaxed">
              Your browser supports direct PWA installation! Tap below to install RECONAI directly on your home screen.
            </p>
            <button
              onClick={onInstallClick}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 font-semibold text-white py-3.5 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
            >
              <Download size={18} />
              <span>Install RECONAI Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Share size={14} className="text-blue-600" />
                <span>iPhone / iPad (Safari)</span>
              </h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                <li>Tap the <span className="font-semibold text-slate-800">Share button</span> <Share size={12} className="inline text-blue-600" /> at the bottom of Safari.</li>
                <li>Scroll down and select <span className="font-semibold text-slate-800">"Add to Home Screen"</span> <PlusSquare size={12} className="inline text-slate-700" />.</li>
                <li>Tap <span className="font-semibold text-blue-600">Add</span> in the top right corner.</li>
              </ol>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <MoreVertical size={14} className="text-blue-600" />
                <span>Android (Chrome / Edge)</span>
              </h3>
              <ol className="text-xs text-slate-600 space-y-2 list-decimal pl-4">
                <li>Tap the <span className="font-semibold text-slate-800">Menu (3 dots)</span> icon <MoreVertical size={12} className="inline text-slate-700" /> in top right.</li>
                <li>Select <span className="font-semibold text-slate-800">"Install app"</span> or <span className="font-semibold text-slate-800">"Add to Home screen"</span>.</li>
                <li>Confirm by clicking <span className="font-semibold text-blue-600">Install</span>.</li>
              </ol>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>Full offline capabilities, fast loading, and dedicated full-screen experience on mobile!</span>
            </div>

            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-slate-800 hover:bg-slate-900 font-semibold text-white py-3 text-sm transition"
            >
              Got It
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

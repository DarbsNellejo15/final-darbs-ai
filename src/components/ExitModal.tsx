import React from "react";
import { LogOut, RotateCcw, X, ShieldCheck, Laptop } from "lucide-react";

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
  onResetSession: () => void;
}

export const ExitModal: React.FC<ExitModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
  onResetSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 dark:border-slate-800">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with DARBS brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
            <img
              src="/src/assets/images/darbs_logo_1791717510434.jpg"
              alt="DARBS Logo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Exit DARBS Diagnostic
            </h3>
            <p className="text-xs text-slate-400">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>
        </div>

        <div className="my-5 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Active Diagnostics Session</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Would you like to reset the diagnostic workspace or safely exit the dashboard session?
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Reset Workspace */}
          <button
            onClick={onResetSession}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4 text-amber-400" />
            <span>Reset Diagnostic Workspace</span>
          </button>

          {/* Direct Exit */}
          <button
            onClick={onConfirmExit}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-900/60 bg-red-950/40 py-2.5 px-4 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Dashboard Session</span>
          </button>
        </div>

        {/* Cancel footer */}
        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel & Return to Chat
          </button>
        </div>
      </div>
    </div>
  );
};

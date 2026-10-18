import React from "react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

export const DeleteHistoryModal: React.FC<DeleteHistoryModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl border border-red-900/60 bg-slate-900 p-6 shadow-2xl text-slate-100 dark:border-slate-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Delete Chat History</h3>
            <p className="text-[11px] text-slate-400">DARBS Diagnostics</p>
          </div>
        </div>

        <div className="my-4 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-xs text-red-200">
          <div className="flex items-center gap-1.5 font-semibold text-red-300 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Are you sure?</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            This will permanently delete all diagnostic sessions and troubleshooting chat history from your device.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirmDelete();
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Yes, Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

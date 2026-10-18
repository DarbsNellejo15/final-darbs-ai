import React from "react";
import {
  Laptop,
  Menu,
  Plus,
  Trash2,
  Volume2,
  VolumeX,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { AppSettings, UserProfile } from "../types";

interface NavbarProps {
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenDeleteModal: () => void;
  onOpenExitModal: () => void;
  settings: AppSettings;
  onToggleSpeech: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewChat,
  onToggleSidebar,
  onOpenDeleteModal,
  onOpenExitModal,
  settings,
  onToggleSpeech,
  currentUser,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-[#070e1b]/95 px-3 md:px-5 backdrop-blur-md text-slate-100">
      {/* Left side: Brand Logo & Sidebar Toggle */}
      <div className="flex items-center gap-2.5 md:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
          title="Toggle Navigation & History"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Brand with DARBS Image Logo & pulsing active status dot */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25 overflow-hidden border border-cyan-400/40 group">
            <img
              src="/src/assets/images/darbs_logo_1791717510434.jpg"
              alt="DARBS Logo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#070e1b] animate-pulse z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wide text-white text-lg md:text-xl">
                DARBS
              </span>
              <span className="hidden sm:inline-flex items-center rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                Laptop Troubleshooter
              </span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 tracking-tight">
              Diagnostic Assistant for Repair, Bugs and Support
            </p>
          </div>
        </div>
      </div>

      {/* Right side controls: New Chat, Delete History, Read/Speech Toggle, User Badge, Exit/Logout */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {/* New Chat Session */}
        <button
          id="btn-navbar-new-chat"
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 transition-colors"
          title="New Diagnostic Chat"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">New Chat</span>
        </button>

        {/* Delete History Button */}
        <button
          id="btn-navbar-delete-history"
          onClick={onOpenDeleteModal}
          className="rounded-lg border border-red-900/60 bg-red-950/40 p-2 text-red-400 hover:bg-red-900/60 hover:text-red-300 transition-colors"
          title="Delete Chat History"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        {/* Speaking Read Button (Turn On / Off) */}
        <button
          id="btn-navbar-toggle-speech"
          onClick={onToggleSpeech}
          className={`flex items-center gap-1 rounded-lg p-2 transition-colors ${
            settings.speechEnabled
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          }`}
          title={
            settings.speechEnabled
              ? "Voice Reading is ON (Click to turn OFF)"
              : "Voice Reading is OFF (Click to turn ON)"
          }
        >
          {settings.speechEnabled ? (
            <>
              <Volume2 className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span className="hidden lg:inline text-[11px] font-medium text-cyan-300">
                Voice ON
              </span>
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 text-slate-400" />
              <span className="hidden lg:inline text-[11px] font-medium text-slate-400">
                Voice OFF
              </span>
            </>
          )}
        </button>

        {/* User Technician Profile Badge */}
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-xs">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-800 text-white font-bold text-[10px] shadow-sm">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src="/src/assets/images/darbs_logo_1791717510434.jpg"
                  alt="Technician Profile"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="text-left leading-tight">
              <div className="font-semibold text-slate-200 text-[11px] truncate max-w-[100px]">
                {currentUser.name}
              </div>
              <div className="text-[9px] text-cyan-400 truncate max-w-[100px]">
                {currentUser.role}
              </div>
            </div>
          </div>
        )}

        {/* Logout / Exit Button */}
        <button
          id="btn-navbar-logout"
          onClick={onLogout}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-red-950/40 hover:text-red-300 hover:border-red-800/50 transition-colors"
          title="Sign Out to Login Portal"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

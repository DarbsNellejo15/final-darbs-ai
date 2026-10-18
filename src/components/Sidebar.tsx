import React, { useState } from "react";
import {
  Laptop,
  Plus,
  Trash2,
  Search,
  X,
  Globe,
  Terminal,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { AppSettings, ChatSession, UserProfile } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions: () => void;
  settings: AppSettings;
  onOpenExitModal: () => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  settings,
  onOpenExitModal,
  currentUser,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay background */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#070e1b] transition-transform duration-300 text-slate-100 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-cyan-400/40 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-sm">
              <img
                src="/src/assets/images/darbs_logo_1791717510434.jpg"
                alt="DARBS Logo"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-wide">
                DARBS
              </span>
              <p className="text-[10px] text-cyan-400 font-medium">
                Diagnostics & Repair
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Card in Sidebar */}
        {currentUser && (
          <div className="mx-3 mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-2.5">
            <div className="flex items-center gap-2.5 truncate">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-cyan-500/40 bg-slate-800 text-white font-bold text-xs shadow-sm">
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
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="truncate">
                <div className="font-semibold text-xs text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-cyan-400 truncate">
                  {currentUser.role}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="rounded-lg p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Start New Diagnostic Chat */}
        <div className="p-3">
          <button
            id="btn-sidebar-new-chat"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 py-2.5 px-4 font-semibold text-white shadow-md shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            New Diagnostic Chat
          </button>
        </div>

        {/* Search Session input */}
        <div className="px-3 pt-1 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search diagnostic logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Diagnostic History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <span>Diagnostic History ({filteredSessions.length})</span>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No diagnostic logs found
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between rounded-xl px-3 py-2 transition-all text-xs cursor-pointer ${
                  session.id === currentSessionId
                    ? "bg-slate-800/90 text-cyan-300 shadow-sm border border-cyan-500/40 font-semibold"
                    : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                }`}
                onClick={() => {
                  onSelectSession(session.id);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <Terminal className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                  <span className="truncate">{session.title}</span>
                </div>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-opacity"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer info & exit */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          {/* Grounding Status Indicator */}
          <div className="flex items-center justify-between rounded-lg bg-slate-900/80 p-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span>Search Grounding:</span>
            </div>
            <span
              className={`font-semibold ${
                settings.enableWebSearch ? "text-cyan-400" : "text-slate-500"
              }`}
            >
              {settings.enableWebSearch ? "Enabled" : "Off"}
            </span>
          </div>

          {/* Delete All History Button */}
          {sessions.length > 1 && (
            <button
              onClick={onClearAllSessions}
              className="flex w-full items-center justify-center gap-1.5 text-xs text-red-400 hover:text-red-300 py-1.5 hover:bg-red-950/20 rounded-lg transition-colors border border-red-900/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete All History
            </button>
          )}

          {/* Dashboard Exit Button */}
          <button
            onClick={onOpenExitModal}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/70 py-2 text-xs font-medium text-slate-300 hover:bg-red-950/30 hover:text-red-300 hover:border-red-800/40 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Exit Dashboard
          </button>
        </div>
      </aside>
    </>
  );
};

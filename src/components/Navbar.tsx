import React from 'react';
import {
  Film,
  Download,
  RotateCcw,
  RotateCw,
  FolderGit2,
  Sparkles,
  Plus
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'editor' | 'android-repo';
  onTabChange: (tab: 'editor' | 'android-repo') => void;
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onNewProject: () => void;
  onOpenExport: () => void;
  onDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  projectTitle,
  onUpdateTitle,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onNewProject,
  onOpenExport,
  onDownloadZip
}) => {
  return (
    <header className="h-14 border-b border-[#1E2538] bg-[#0A0D15]/95 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Tab Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#141A29] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <span className="font-black text-[#00E5FF] text-lg tracking-wider">Z</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-extrabold tracking-wider text-slate-100 flex items-center gap-1.5">
              ZARVIMO <span className="text-[#00E5FF] text-xs font-semibold">STUDIO</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">Phase 1 Media3 Engine</p>
          </div>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="flex items-center bg-[#101522] border border-[#1E2638] p-0.5 rounded-lg">
          <button
            onClick={() => onTabChange('editor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'editor'
                ? 'bg-[#1C2438] text-[#00E5FF] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Editor</span>
          </button>
          <button
            onClick={() => onTabChange('android-repo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'android-repo'
                ? 'bg-[#1C2438] text-[#00E5FF] shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span className="flex items-center gap-1">
              Android Repo & CI
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            </span>
          </button>
        </div>
      </div>

      {/* Project Title & History */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={projectTitle}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="bg-transparent hover:bg-[#131826] focus:bg-[#131826] border border-transparent focus:border-[#2A344C] rounded px-2.5 py-1 text-xs font-medium text-slate-200 focus:outline-none max-w-[180px] text-center transition-colors truncate"
          title="Click to rename project"
        />

        <div className="flex items-center bg-[#101522] border border-[#1E2638] rounded-md p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-[#1C2438] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-[#1C2438] disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNewProject}
          title="Create New Project"
          className="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-[#1E2638] bg-[#101522] hover:bg-[#161D2E] text-slate-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>New</span>
        </button>

        <button
          onClick={onDownloadZip}
          title="Download complete Android project repository as ZIP"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#7C3AED]/40 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 text-[#C4B5FD] transition-all"
        >
          <Download className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span className="hidden sm:inline">Repo ZIP</span>
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00B0FF] text-[#080B11] shadow-[0_0_14px_rgba(0,229,255,0.35)] transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};

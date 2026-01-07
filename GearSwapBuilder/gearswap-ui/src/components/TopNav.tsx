import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGearStore } from "@/store/useGearStore";
import { Download, Upload, Trash2, Swords, Search, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { parseLuaToSets } from "@/lib/luaImporter";
import { generateUpdatedLua } from "@/lib/luaexporter";
import { ExportPreviewDialog } from "./ExportPreviewDialog";

export function TopNav() {
  const {
    allSets,
    baseSets,
    importSets,
    clearSets,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    setLuaCode,
    characterName,
    luaCode,
    jobName,
    setCharacterInfo
  } = useGearStore();

  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);
  const [exportCode, setExportCode] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasSets = Object.keys(allSets || {}).length > 0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.replace('.lua', '');
    const [rawName, rawJob] = fileName.split('_');
    if (rawName && rawJob) {
      setCharacterInfo(rawName, rawJob.toUpperCase());
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        setLuaCode(text);
        const { sets, baseSets: importedBases } = parseLuaToSets(text);
        importSets(sets, importedBases);

        const paths = Object.keys(sets);
        const idlePath = paths.find(p => p.toLowerCase().includes('idle')) || paths[0];
        if (idlePath) setActiveTab(idlePath);

      } catch (err) {
        console.error("Import Error:", err);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    // Generate the most up-to-date lua
    const finalLua = generateUpdatedLua(luaCode, allSets, baseSets);
    setExportCode(finalLua);
    setShowExportPreview(true);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/80 backdrop-blur-md">
      <div className="max-w-[1800px] mx-auto px-6 h-16 flex items-center justify-between gap-8">

        {/* Left Side: Brand & Character Info */}
        <div className="flex items-center gap-4 shrink-0 min-w-[300px]">
          <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/50 flex items-center justify-center shadow-[0_0_15px_rgba(var(--brand-rgb),0.2)]">
            {jobName ? (
              <span className="text-brand font-black text-[10px] tracking-tighter">{jobName.substring(0, 3)}</span>
            ) : (
              <Swords className="text-brand w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col">
            <h1 className="app-title text-sm leading-none">
              GearSwap <span className="text-white">Studio</span>
            </h1>
            {characterName ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">{characterName}</span>
                <span className="text-[10px] text-zinc-600 font-bold">/</span>
                <span className="text-[10px] text-brand font-bold uppercase tracking-wider">{jobName}</span>
              </div>
            ) : (
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">No File Loaded</p>
            )}
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-xl relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 z-10" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sets or items..."
            className="w-full bg-white/5 border-white/10 pl-10 pr-10 text-xs text-white focus-visible:ring-1 focus-visible:ring-brand h-9 ff-window !rounded-none"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-500 hover:text-white z-10"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <div className="w-[1px] h-6 bg-white/10 mx-1" />
          <Input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".lua" className="hidden" />

          <Button
            variant="ghost"
            className="ff-interactive text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-white"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2 text-brand" />
            Import
          </Button>

          <Button
            variant="ghost"
            className="ff-interactive text-[10px] uppercase font-bold tracking-widest text-zinc-400 hover:text-white"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2 text-brand" />
            Export
          </Button>

          {hasSets && (
            <Button
              onClick={() => setShowPurgeConfirm(true)}
              className="ff-interactive h-9 px-4 !bg-red-600/10 hover:!bg-red-600 !text-red-500 hover:!text-white text-[10px] font-bold uppercase tracking-widest !border !border-red-600/30 transition-all"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <DeleteConfirmDialog
        open={showPurgeConfirm}
        onOpenChange={setShowPurgeConfirm}
        onConfirm={() => {
          clearSets();
          setShowPurgeConfirm(false);
          setActiveTab('sets.idle');
        }}
        title="Purge All Data"
        itemName="ALL gear sets and character info"
      />


      <ExportPreviewDialog
        open={showExportPreview}
        onOpenChange={setShowExportPreview}
        initialCode={exportCode}
        suggestedFileName={characterName && jobName ? `${characterName}_${jobName}_Gear.lua` : "Exported_Gear.lua"}
      />
    </nav>
  );
}
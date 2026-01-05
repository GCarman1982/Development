import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGearStore, EquippedItem } from "@/store/useGearStore";
import { cn } from "@/lib/utils";
import { Edit3, Trash2, Copy, Loader2 } from "lucide-react";
import { useItemSearch } from "@/lib/hooks/useItemSearch";

export function SlotPicker({ slot, setName }: { slot: string; setName: string }) {
  const { allSets, updateSlot, isLoadingItems, openAugmentModal } = useGearStore();
  const [open, setOpen] = useState(false);

  const { search, setSearch, filteredItems } = useItemSearch(slot);

  const itemData = allSets[setName]?.[slot];

  const typedItem = useMemo((): EquippedItem | null => {
    if (!itemData) return null;
    if (typeof itemData === 'string') return { name: itemData };
    return itemData;
  }, [itemData]);

  const displayName = typedItem?.name || "";
  const isEquipped = !!displayName;

  const augments = typedItem?.augments || [];
  const hasAugments = augments.length > 0 || !!typedItem?.path || !!typedItem?.rank;

  return (
    <TooltipProvider delayDuration={400}>
      <div className="w-full h-full">
        <ContextMenu>
          <ContextMenuTrigger disabled={!isEquipped}>
            <Popover open={open} onOpenChange={setOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <div className={cn(
                      "ff-window ff-interactive flex flex-col p-3 min-h-[85px] h-full cursor-pointer transition-all relative !rounded-none border",
                      isEquipped
                        ? "border-brand"
                        : "border-white/5 bg-black/40 hover:bg-white/5"
                    )}>

                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-[0.2em] transition-colors",
                          isEquipped ? "text-white/60" : "text-white/30"
                        )}>
                          {slot}
                        </span>

                        {hasAugments && (
                          <span className="text-[8px] bg-lua-green/20 text-lua-green px-1.5 py-0.5 border border-lua-green/30 font-bold rounded-[2px] shadow-[0_0_5px_rgba(34,197,94,0.3)]">
                            AUG
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center py-1">
                        <div className={cn(
                          "text-[13px] text-center line-clamp-2 leading-tight tracking-wide",
                          isEquipped
                            ? "text-white font-bold antialiased [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
                            : "text-white/10 italic uppercase"
                        )}>
                          {displayName || "None"}
                        </div>
                      </div>

                      {/* Side Indicator Bar */}
                      {isEquipped && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[50%] bg-brand shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                      )}
                    </div>
                  </PopoverTrigger>
                </TooltipTrigger>

                {isEquipped && (
                  <TooltipContent side="right" className="ff-tooltip !rounded-none z-[100]">
                    <div className="tooltip-title">{displayName}</div>

                    <div className="space-y-1 mt-2">
                      {typedItem?.path && (
                        <p className="text-lua-orange text-[12px] font-bold">Path: {typedItem.path}</p>
                      )}
                      {typedItem?.rank && (
                        <p className="text-amber-400 text-[12px] font-bold">Rank: {typedItem.rank}</p>
                      )}
                      {augments.length > 0 ? (
                        augments.map((aug, i) => (
                          <p key={i} className="tooltip-aug">• {aug}</p>
                        ))
                      ) : !hasAugments && (
                        <p className="text-white/40 italic text-[11px]">No additional stats</p>
                      )}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>

              <PopoverContent className="w-[260px] p-0 ff-window bg-black/95 backdrop-blur-xl border-white/20 shadow-2xl z-50 overflow-hidden !rounded-none">
                <Command shouldFilter={false} className="bg-transparent text-white">
                  <CommandInput
                    placeholder={`Search ${slot}...`}
                    value={search}
                    onValueChange={setSearch}
                    className="h-11 text-sm border-none bg-white/5 text-white placeholder:text-white/20"
                  />
                  <CommandList className="max-h-72 custom-scrollbar">
                    {isLoadingItems ? (
                      <div className="p-8 flex flex-col items-center justify-center gap-2 text-white/40">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Loading Database...</span>
                      </div>
                    ) : (
                      <>
                        <CommandEmpty className="p-6 text-xs italic text-white/40 text-center">No results in database.</CommandEmpty>
                        <CommandGroup>
                          {filteredItems.map(item => (
                            <CommandItem
                              key={item}
                              onSelect={() => {
                                updateSlot(setName, slot, item);
                                setSearch("");
                                setOpen(false);
                              }}
                              className="ff-interactive text-xs py-3 px-8 text-white/70 hover:bg-brand/20 hover:text-white border-b border-white/5 last:border-0"
                            >
                              {item}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </ContextMenuTrigger>

          <ContextMenuContent className="ff-window bg-zinc-950 border-white/10 min-w-[180px] !rounded-none p-1 shadow-3xl">
            <div className="px-2 py-1.5 text-[10px] font-black text-white/30 uppercase tracking-tighter">
              Item Options
            </div>
            <ContextMenuItem
              className="text-xs text-white/80 focus:bg-brand/30 focus:text-white cursor-pointer gap-2 py-2"
              onSelect={() => openAugmentModal(setName, slot, typedItem || { name: displayName })}
            >
              <Edit3 size={14} className="text-lua-green" />
              Edit Augments
            </ContextMenuItem>

            <ContextMenuItem
              className="text-xs text-white/80 focus:bg-brand/30 focus:text-white cursor-pointer gap-2 py-2"
              onSelect={() => navigator.clipboard.writeText(displayName)}
            >
              <Copy size={14} className="text-sky-400" />
              Copy Name
            </ContextMenuItem>

            <ContextMenuSeparator className="bg-white/10 my-1" />

            <ContextMenuItem
              className="text-xs text-red-400 focus:bg-red-500/20 focus:text-red-400 cursor-pointer gap-2 py-2"
              onSelect={() => updateSlot(setName, slot, "")}
            >
              <Trash2 size={14} />
              Unequip Item
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>
    </TooltipProvider>
  );
}

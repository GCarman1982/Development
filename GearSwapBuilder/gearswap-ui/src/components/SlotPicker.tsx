import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useGearStore } from "@/store/useGearStore";
import { cn } from "@/lib/utils";

export function SlotPicker({ slot, setName }: { slot: string; setName: string }) {
  const { allSets, updateSlot, searchableItems } = useGearStore();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const rawSelected = allSets[setName]?.[slot] || "";

  const selected = useMemo(() => {
    if (!rawSelected) return "";
    if (typeof rawSelected === 'string') return rawSelected;
    if (typeof rawSelected === 'object' && rawSelected !== null) {
      return (rawSelected as any).name || "";
    }
    return "";
  }, [rawSelected]);
    
  const isEquipped = !!selected;

  return (
    <div className="w-full h-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className={cn(
            "ff-window ff-interactive flex flex-col p-3 min-h-[85px] h-full cursor-pointer transition-all relative !rounded-none border",
            isEquipped 
              ? "bg-brand/10 border-white/10" 
              : "border-white/5 bg-black/40 hover:bg-white/5"
          )}>
            
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
              {slot}
            </span>

            <div className="flex-1 flex items-center justify-center py-1">
              <div className={cn(
                "text-[12px] text-center line-clamp-2",
                isEquipped ? 'text-white font-bold' : 'text-white/20 italic uppercase'
              )}>
                {selected || "None"}
              </div>
            </div>

            {isEquipped && (
              /* Replaced inline style with Tailwind classes for the side indicator */
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[40%] bg-brand shadow-[2px_0_10px_rgba(var(--brand-rgb),0.8)] rounded-r-[2px]" 
              />
            )}
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-[240px] p-0 ff-window bg-black/90 backdrop-blur-xl border-none shadow-2xl z-50 overflow-hidden !rounded-none">
          <Command shouldFilter={false} className="bg-transparent text-white">
            <CommandInput 
              placeholder={`Search ${slot}...`} 
              value={search} 
              onValueChange={setSearch}
              className="h-10 text-xs border-none bg-white/5 text-white placeholder:text-white/30" 
            />
            <CommandList className="max-h-64 custom-scrollbar">
              <CommandEmpty className="p-4 text-xs italic text-white/50 text-center">No items found.</CommandEmpty>
              <CommandGroup>
                <CommandItem 
                  onSelect={() => { 
                    updateSlot(setName, slot, ""); 
                    setSearch(""); 
                    setOpen(false); 
                  }} 
                  className="ff-interactive text-xs py-2.5 px-8 text-red-400 hover:bg-red-500/10 border-b border-white/5"
                >
                  [ Clear Slot ]
                </CommandItem>
                {(searchableItems[slot] || [])
                  .filter(item => !search || item.toLowerCase().includes(search.toLowerCase()))
                  .slice(0, 100)
                  .map(item => (
                    <CommandItem 
                      key={item} 
                      onSelect={() => { 
                        updateSlot(setName, slot, item); 
                        setSearch(""); 
                        setOpen(false); 
                      }} 
                      className="ff-interactive text-xs py-2.5 px-8 text-white/80 hover:bg-brand/20 hover:text-white"
                    >
                      {item}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
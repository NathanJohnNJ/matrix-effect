'use client';
import React, { useState } from "react";
import { TrashIcon } from '@heroicons/react/24/outline';

export default function ColorSelector({color, index, settings, setSettings}: React.ComponentProps<any>){
  const [showDelete, setShowDelete] = useState(false);
  
  const updateColor = (index: number, value: string) => {
    const nextColors = [...settings.gradientColors];
    nextColors[index] = value;
    setSettings((current: string[]) => ({ ...current, gradientColors: nextColors }));
  };

  const deleteColor = (e: any,index: number) => {
    e.preventDefault()
    const nextColors = [...settings.gradientColors];
    nextColors.splice(index, 1);
    const nextStops = [...settings.gradientStops];
    nextStops.splice(index, 1);
    setSettings((current: string[]) => ({
      ...current,
      gradientColors: nextColors,
      gradientStops: nextStops,
    }));
  };

  return (
    <label key={`${color}-${index}`} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-200 relative" onMouseEnter={()=>setShowDelete(true)} onMouseLeave={()=>setShowDelete(false)}>
      <span className="inline-block h-8 w-8 rounded-md border border-white/20" style={{ background: color }} />
      <input
        type="color"
        value={color}
        onChange={(event) => updateColor(index, event.target.value)}
        className="h-10 w-full cursor-pointer"
      />
      { showDelete &&          
        <span className="bg-stone-900 border-zinc-300/40 p-1 border rounded-full text-zinc-300/40 hover:text-red-800/80 hover:border-red-800/80 hover:font-extrabold absolute top-2 z-50 right-2"><TrashIcon className="w-4 h-4" onClick={(e)=>deleteColor(e, index)} /></span>
      }
    </label>
  )
}
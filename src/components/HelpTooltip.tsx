import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  title: string;
  content: string;
  example?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  example,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={tooltipRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Explication pour novice : ${title}`}
        className="p-0.5 text-slate-500 hover:text-amber-400 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
        title="Cliquez pour afficher l'explication simple"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 bg-[#1E293B] border border-amber-400/40 rounded-xl shadow-2xl text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-750">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>{title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="mt-2 text-slate-300 leading-relaxed font-normal">
            {content}
          </p>

          {example && (
            <div className="mt-2.5 p-2 bg-slate-900/80 rounded border border-slate-800 text-[11px] text-amber-200/90 font-mono">
              <span className="font-semibold text-slate-400 font-sans block mb-0.5">Exemple simple :</span>
              {example}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

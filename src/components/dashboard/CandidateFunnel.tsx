import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const funnelData = [
  { label: 'Total Candidates', count: 1, base: 1, percentage: 100 },
  { label: 'Resume Analysis', count: 0, percentage: 0 },
  { label: 'Recruiter Screening', count: 0, percentage: 0 },
  { label: 'Functional Interview', count: 0, percentage: 0 },
  { label: 'Completed', count: 0, percentage: 0 },
  { label: 'Qualified', count: 0, percentage: 0 },
];

const sources = [
  { label: 'Career Page', count: 0, color: 'bg-blue-500' },
  { label: 'ATS', count: 0, color: 'bg-cyan-400' },
  { label: 'Bulk Upload', count: 0, color: 'bg-orange-500' },
  { label: 'Scheduled', count: 1, color: 'bg-pink-500' },
  { label: 'Direct Link', count: 0, color: 'bg-emerald-500' },
];

export default function CandidateFunnel() {
  return (
    <div className="flex flex-col h-full mt-4">
      {/* Funnel Chart Area */}
      <div className="flex-1 flex flex-col items-center justify-start gap-1 pb-8 w-full">
        {funnelData.map((stage, index) => {
          // Narrowing funnel calculation (top wide, bottom narrow)
          const widthPercent = 100 - (index * 14); 

          return (
            <div key={stage.label} className="w-full flex flex-col items-center group relative cursor-pointer">
              <div className="w-full flex items-center gap-4 relative">
                {/* Left Label Stack */}
                <div className="w-1/3 flex justify-end pr-2 text-right">
                   <span className="text-xs font-semibold text-foreground">{stage.label}</span>
                </div>
                
                {/* Center Funnel Bar */}
                <div className="w-1/3 flex justify-center py-1">
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${widthPercent}%`, opacity: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1, type: 'spring' }}
                    className={clsx(
                      "h-10 transition-all duration-300 relative overflow-hidden",
                      index === 0 ? "bg-fuchsia-800 rounded-t-lg" : 
                      index === funnelData.length - 1 ? "bg-fuchsia-400 rounded-b-lg" : 
                      "bg-fuchsia-" + (800 - (index * 100))
                    )}
                    style={{ backgroundColor: `hsl(320, 50%, ${35 + (index * 8)}%)` }}
                  >
                     <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors" />
                     {/* Tooltip on Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-foreground text-background text-[10px] font-bold rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                        {stage.label}: {stage.count} ({stage.percentage}%)
                     </div>
                  </motion.div>
                </div>
                
                {/* Right Value Stack */}
                <div className="w-1/3 flex justify-start pl-2 text-left">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{stage.count}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {index === 0 ? `${stage.base} baseline` : `${stage.count} ${stage.percentage}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Separator Line */}
              {index < funnelData.length - 1 && (
                 <div className="w-1/3 h-[1px] border-b border-dashed border-border my-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Source Breakdown (Bottom) */}
      <div className="mt-auto pt-6 border-t border-border flex flex-wrap justify-between items-center gap-4">
        {sources.map(source => (
           <div key={source.label} className="flex flex-col items-center gap-1.5 min-w-[60px]">
             <div className="flex items-center gap-1.5">
               <div className={clsx("w-2 h-2 rounded-full", source.color)} />
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{source.label}</span>
             </div>
             <span className="text-sm font-black text-foreground">{source.count}</span>
           </div>
        ))}
      </div>
    </div>
  );
}

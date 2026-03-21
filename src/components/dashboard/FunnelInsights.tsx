import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, Sparkles } from 'lucide-react';

const defaultInsights = [
  { id: '1', text: 'Low resume analysis rate detected. Consider refining key skill matching.', type: 'warning' },
  { id: '2', text: 'Increase sourcing from LinkedIn for better Functional interview pass rates.', type: 'recommendation' },
  { id: '3', text: 'Recruiter screening efficiency increased by 15% this week.', type: 'success' },
];

export default function FunnelInsights({ insights = defaultInsights, onAction }: { insights?: typeof defaultInsights, onAction?: (tab: any) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl p-6 bg-card border border-border shadow-sm min-h-[300px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            Funnel Insights <Sparkles size={16} className="text-primary" />
          </h3>
          <p className="text-muted-foreground text-xs mt-1">AI Recommendations</p>
        </div>
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <Lightbulb size={16} />
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {insights.map((insight) => (
          <div 
            key={insight.id}
            onClick={() => {
              if (insight.type === 'warning') onAction?.('Resume Analysis');
              else if (insight.type === 'recommendation') onAction?.('Recruiter Screening');
              else onAction?.('Overview');
            }}
            className="p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted hover:border-border/80 transition-all duration-300 flex items-start gap-3 cursor-pointer group"
          >
            <div className="mt-1 shrink-0">
              <div className={`w-2 h-2 rounded-full ${
                insight.type === 'warning' ? 'bg-warning' : 
                insight.type === 'recommendation' ? 'bg-primary' : 'bg-success'
              }`} />
            </div>
            <div className="flex-1">
              <p className="text-foreground text-xs leading-relaxed group-hover:text-primary transition-colors">
                {insight.text}
              </p>
            </div>
            <ArrowRight size={14} className="text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

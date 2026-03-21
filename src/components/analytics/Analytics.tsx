import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Video, Clock, CreditCard, ChevronDown, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { clsx } from 'clsx';

const kpiData = [
  { id: '1', label: 'Total Candidates Screened', value: 2845, change: '+12%', trend: 'up', icon: Users, color: 'text-violet-500 bg-violet-500/10' },
  { id: '2', label: 'Interviews Conducted', value: 845, change: '+8%', trend: 'up', icon: Video, color: 'text-blue-500 bg-blue-500/10' },
  { id: '3', label: 'Avg. Time to Screen', value: 4.2, suffix: ' mins', change: '-15%', trend: 'up', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
  { id: '4', label: 'Credits Used', value: '450', suffix: ' / 1000', change: '', trend: 'none', icon: CreditCard, color: 'text-emerald-500 bg-emerald-500/10' },
];

const tableData = [
  { id: '1', title: 'Senior Product Designer', status: 'Active', processed: 450, interviews: 120, credits: 150 },
  { id: '2', title: 'Frontend Developer', status: 'Draft', processed: 0, interviews: 0, credits: 0 },
  { id: '3', title: 'Marketing Manager', status: 'Active', processed: 210, interviews: 45, credits: 89 },
  { id: '4', title: 'Data Scientist', status: 'Archived', processed: 890, interviews: 210, credits: 350 },
];

export default function Analytics() {
  return (
    <div className="space-y-8 min-h-full">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Usage Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform consumption and hiring metrics.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground appearance-none pr-10 focus:outline-none focus:border-primary shadow-sm hover:bg-muted/50 transition-colors">
              <option>All Jobs</option>
              <option>Senior Product Designer</option>
              <option>Frontend Developer</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
          
          <div className="relative">
            <select className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium text-foreground appearance-none pl-10 pr-10 focus:outline-none focus:border-primary shadow-sm hover:bg-muted/50 transition-colors">
              <option>Last 30 Days</option>
              <option>Last Quarter</option>
              <option>Year to Date</option>
            </select>
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-sm font-bold text-muted-foreground">{kpi.label}</span>
                <div className={clsx("p-2.5 rounded-xl border border-transparent", kpi.color)}>
                  <Icon size={18} />
                </div>
              </div>
              
              <div className="flex items-baseline gap-3">
                <AnimatedCounter value={kpi.value} suffix={kpi.suffix} />
                
                {kpi.trend !== 'none' && (
                  <span className={clsx(
                    "text-xs font-bold flex items-center gap-0.5 ml-auto px-2 py-1 rounded-full",
                    kpi.trend === 'up' ? "text-success bg-success/10" : "text-danger bg-danger/10"
                  )}>
                    {kpi.trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    {kpi.change}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Job-Wise Breakdown Table */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
          <h3 className="font-bold text-lg text-foreground">Job-Wise Breakdown</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Job Title</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Candidates Processed</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Interviews</th>
                <th className="px-6 py-4 font-bold text-muted-foreground uppercase tracking-wider text-xs text-right">Credits Consumed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-foreground group-hover:text-primary transition-colors">
                    {row.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                      row.status === 'Active' ? "bg-success/10 text-success border-success/20" :
                      row.status === 'Draft' ? "bg-warning/10 text-warning border-warning/20" :
                      "bg-muted border-border text-muted-foreground"
                    )}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">{row.processed}</td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">{row.interviews}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">{row.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: number | string; suffix?: string }) {
  const [count, setCount] = useState<number | string>(value);

  useEffect(() => {
    if (typeof value === 'string') {
      setCount(value);
      return;
    }
    let start = 0;
    const duration = 1000;
    const increment = Math.ceil(value / (duration / 16));
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="text-3xl font-bold tracking-tight text-foreground">
      {typeof count === 'number' && Number.isInteger(count) ? count.toLocaleString() : (typeof count === 'number' ? count.toFixed(1) : count)}
      <span className="text-lg text-muted-foreground font-medium ml-1">{suffix}</span>
    </span>
  );
}

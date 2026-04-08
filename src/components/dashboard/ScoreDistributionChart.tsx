import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

export type ScoreBucket = {
  range: string;
  percentage: number;
  candidates: number;
};

const defaultData: ScoreBucket[] = [];

export default function ScoreDistributionChart({ data = defaultData }: { data?: ScoreBucket[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
          <XAxis 
            dataKey="range" 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 8 }}
            contentStyle={{ 
              backgroundColor: '#18181b', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              padding: '10px 14px'
            }}
            labelStyle={{ color: '#a1a1aa', fontSize: '12px', marginBottom: '4px' }}
            formatter={(value: any, name: any) => {
              if (name === 'percentage') {
                return [`${value}%`, 'Percentage'];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Score Range: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 shadow-xl glass">
                    <p className="text-zinc-400 text-xs font-medium mb-1">Score: {label}</p>
                    <p className="text-zinc-100 font-bold text-lg">{data.percentage}%</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{data.candidates} Candidates</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="percentage" 
            radius={[8, 8, 0, 0]}
            animationBegin={300}
            animationDuration={1000}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 2 ? 'url(#colorBarActive)' : 'url(#colorBar)'} 
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="colorBarActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

import React, { useMemo } from 'react';
import { Trip } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { APP_CONFIG } from '../constants';
import { LogoIcon } from '../components/Icons';

interface StatsProps {
  trips: Trip[];
  onBack: () => void;
}

const MonthlyStatsScreen: React.FC<StatsProps> = ({ trips, onBack }) => {
  const dataByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    trips.forEach(trip => {
      trip.expenses.forEach(exp => {
        categories[exp.category] = (categories[exp.category] || 0) + exp.amount;
      });
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [trips]);

  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h2 className="text-2xl font-bold">Monthly Insights</h2>
        </div>
        <LogoIcon className="w-8 h-8" />
      </div>

      <div className="bg-indigo-50 rounded-3xl p-6 mb-8 text-center border border-indigo-100">
        <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Total Spend - {new Date().toLocaleString('default', { month: 'long' })}</p>
        <h3 className="text-4xl font-black text-indigo-900 mt-1">
          {APP_CONFIG.currencySymbol}{dataByCategory.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN')}
        </h3>
      </div>

      <div className="space-y-8 pb-10">
        <section>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Category Breakdown</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${APP_CONFIG.currencySymbol}${value.toLocaleString('en-IN')}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {dataByCategory.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
                <span className="text-xs font-bold text-gray-900 ml-auto">{APP_CONFIG.currencySymbol}{item.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Trip Frequency</h4>
          <div className="h-48 bg-gray-50 rounded-2xl p-4 flex items-center justify-center italic text-gray-400 text-sm">
            Heat map for Indian routes coming soon...
          </div>
        </section>
      </div>
    </div>
  );
};

export default MonthlyStatsScreen;
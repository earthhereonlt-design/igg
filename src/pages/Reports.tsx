import { useState, useEffect } from 'react';
import { fetchAPI } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { RefreshCw, Sparkles } from 'lucide-react';

export default function Reports() {
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [aiReport, setAiReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    fetchAPI('/progress/weekly')
      .then(data => {
        setWeeklyData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const generateReport = async () => {
    setReportLoading(true);
    try {
      const data = await fetchAPI('/reports/weekly', {
        method: 'POST',
        body: JSON.stringify({ stats: weeklyData })
      });
      setAiReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  };

  const formatChartData = () => {
    return weeklyData.map(d => ({
      name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
      listening: d.listening_total_questions > 0 ? (d.listening_correct_answers / d.listening_total_questions) * 100 : 0,
      reading: d.reading_total_questions > 0 ? (d.reading_correct_answers / d.reading_total_questions) * 100 : 0,
    }));
  };

  const chartData = formatChartData();

  if (loading) return <div className="p-8 text-center">Loading reports...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pt-8"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Insights</h1>
          <p className="text-[var(--text-sec)]">Last 7 days overview</p>
        </div>
      </header>

      <section className="glass-card p-6 h-80">
        <h2 className="text-xl font-semibold mb-6">Performance Accuracy (%)</h2>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorL" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2997FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2997FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6600" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" stroke="var(--text-sec)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--text-sec)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '12px' }} />
            <Area type="monotone" dataKey="listening" stroke="#2997FF" fillOpacity={1} fill="url(#colorL)" name="Listening" />
            <Area type="monotone" dataKey="reading" stroke="#FF6600" fillOpacity={1} fill="url(#colorR)" name="Reading" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-purple-500 text-white rounded-lg">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-semibold">AI Tutor Report</h2>
          </div>
          <button 
            onClick={generateReport}
            disabled={reportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--border)] hover:bg-[#2997FF]/10 hover:text-[#2997FF] rounded-xl transition-colors font-medium text-sm"
          >
            {reportLoading ? <RefreshCw className="animate-spin" size={16} /> : 'Generate Report'}
          </button>
        </div>

        {aiReport ? (
          <div className="space-y-6">
            <div className="p-4 bg-[var(--border)] rounded-xl">
              <h3 className="font-semibold mb-2">Summary</h3>
              <p className="text-[var(--text-sec)] text-sm leading-relaxed">{aiReport.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl">
                <h3 className="font-semibold text-green-500 mb-3">Strengths</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-green-700 dark:text-green-400">
                  {aiReport.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                <h3 className="font-semibold text-red-500 mb-3">Areas to Improve</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-red-700 dark:text-red-400">
                  {aiReport.weaknesses.map((w: string, i: number) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
              <h3 className="font-semibold text-blue-500 mb-3">Action Plan</h3>
              <ul className="list-decimal pl-5 text-sm space-y-2 text-[var(--text)]">
                {aiReport.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-[var(--text-sec)]">
            <p>Generate an AI-powered report based on your last 7 days of practice.</p>
          </div>
        )}
      </section>

    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { fetchAPI } from '../lib/api';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Headphones, BookOpen, PenTool, Mic } from 'lucide-react';

export default function Dashboard() {
  const [progress, setProgress] = useState<any>(null);
  const [vocab, setVocab] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI('/progress/today'),
      fetchAPI('/vocab/today')
    ]).then(([progData, vocabData]) => {
      setProgress(progData);
      setVocab(vocabData);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const updateProgress = async (updates: any) => {
    const newData = { ...progress, ...updates };
    setProgress(newData); // optimistic update
    try {
      const saved = await fetchAPI('/progress/today', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      setProgress(saved);
    } catch (err) {
      console.error(err);
    }
  };

  const calculatePerformance = (correct: number, total: number) => {
    if (total === 0) return { label: 'No Data', color: 'text-gray-500' };
    const pct = (correct / total) * 100;
    if (pct < 40) return { label: 'Low', color: 'text-red-500' };
    if (pct < 60) return { label: 'Medium', color: 'text-orange-500' };
    if (pct < 80) return { label: 'Good', color: 'text-blue-500' };
    return { label: 'Excellent', color: 'text-green-500' };
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const listeningPerf = calculatePerformance(progress?.listening_correct_answers || 0, progress?.listening_total_questions || 0);
  const readingPerf = calculatePerformance(progress?.reading_correct_answers || 0, progress?.reading_total_questions || 0);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-6 md:p-12 max-w-7xl mx-auto space-y-8 pt-8"
    >
      <header>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Today</h1>
        <p className="text-[var(--text-sec)]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Listening Tracker */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#2997FF]/10 text-[#2997FF] rounded-lg">
              <Headphones size={24} />
            </div>
            <h2 className="text-xl font-semibold">Listening</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-sec)]">Tests Done</span>
              <span className="font-medium text-lg">{progress?.listening_tests_done || 0} / 3</span>
            </div>
            <input 
              type="range" min="0" max="3" 
              value={progress?.listening_tests_done || 0}
              onChange={(e) => updateProgress({ listening_tests_done: parseInt(e.target.value) })}
              className="w-full accent-[#2997FF]"
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-xs text-[var(--text-sec)] uppercase tracking-wider">Correct</label>
                <input 
                  type="number" 
                  value={progress?.listening_correct_answers || 0}
                  onChange={(e) => updateProgress({ listening_correct_answers: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[var(--border)] border border-transparent focus:border-[#2997FF] rounded-lg p-2 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-sec)] uppercase tracking-wider">Total</label>
                <input 
                  type="number" 
                  value={progress?.listening_total_questions || 0}
                  onChange={(e) => updateProgress({ listening_total_questions: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[var(--border)] border border-transparent focus:border-[#2997FF] rounded-lg p-2 outline-none"
                />
              </div>
            </div>
            
            <div className={`mt-2 text-sm font-medium ${listeningPerf.color}`}>
              Performance: {listeningPerf.label}
            </div>
          </div>
        </section>

        {/* Reading Tracker */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#FF6600]/10 text-[#FF6600] rounded-lg">
              <BookOpen size={24} />
            </div>
            <h2 className="text-xl font-semibold">Reading</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-sec)]">Passages Done</span>
              <span className="font-medium text-lg">{progress?.reading_passages_done || 0} / 6</span>
            </div>
            <input 
              type="range" min="0" max="6" 
              value={progress?.reading_passages_done || 0}
              onChange={(e) => updateProgress({ reading_passages_done: parseInt(e.target.value) })}
              className="w-full accent-[#FF6600]"
            />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <label className="text-xs text-[var(--text-sec)] uppercase tracking-wider">Correct</label>
                <input 
                  type="number" 
                  value={progress?.reading_correct_answers || 0}
                  onChange={(e) => updateProgress({ reading_correct_answers: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[var(--border)] border border-transparent focus:border-[#FF6600] rounded-lg p-2 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-sec)] uppercase tracking-wider">Total</label>
                <input 
                  type="number" 
                  value={progress?.reading_total_questions || 0}
                  onChange={(e) => updateProgress({ reading_total_questions: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 bg-[var(--border)] border border-transparent focus:border-[#FF6600] rounded-lg p-2 outline-none"
                />
              </div>
            </div>
            
            <div className={`mt-2 text-sm font-medium ${readingPerf.color}`}>
              Performance: {readingPerf.label}
            </div>
          </div>
        </section>

        {/* Speaking Tracker */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <Mic size={24} />
            </div>
            <h2 className="text-xl font-semibold">Speaking</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="flex justify-between text-xs text-[var(--text-sec)] uppercase tracking-wider mb-1">
                <span>Cue Cards</span>
                <span className="font-medium text-lg text-[var(--text)]">{progress?.speaking_cue_cards || 0}</span>
              </label>
              <input 
                type="number" min="0"
                value={progress?.speaking_cue_cards || 0}
                onChange={(e) => updateProgress({ speaking_cue_cards: parseInt(e.target.value) || 0 })}
                className="w-full bg-[var(--border)] border border-transparent focus:border-green-500 rounded-lg p-2 outline-none"
              />
            </div>
            
            <div className="pt-2">
              <label className="flex justify-between text-xs text-[var(--text-sec)] uppercase tracking-wider mb-1">
                <span>Intro Questions</span>
                <span className="font-medium text-lg text-[var(--text)]">{progress?.speaking_intro_questions || 0}</span>
              </label>
              <input 
                type="number" min="0"
                value={progress?.speaking_intro_questions || 0}
                onChange={(e) => updateProgress({ speaking_intro_questions: parseInt(e.target.value) || 0 })}
                className="w-full bg-[var(--border)] border border-transparent focus:border-green-500 rounded-lg p-2 outline-none"
              />
            </div>
            
            <div className="pt-4">
              <button 
                onClick={() => updateProgress({ speaking_practice_done: !progress?.speaking_practice_done })}
                className="flex items-center gap-3 w-full p-2 hover:bg-[var(--border)] rounded-lg transition-colors text-left"
              >
                {progress?.speaking_practice_done 
                  ? <CheckCircle2 className="text-green-500" /> 
                  : <Circle className="text-[var(--text-sec)]" />}
                <span className={progress?.speaking_practice_done ? 'line-through text-[var(--text-sec)]' : ''}>
                  Full Mock Test Done
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Writing & Tasks Checklist */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <PenTool size={24} />
            </div>
            <h2 className="text-xl font-semibold">Tasks Check</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'writing_task1_done', label: 'Writing Task 1' },
              { id: 'writing_task2_done', label: 'Writing Task 2' },
              { id: 'mistakes_analyzed', label: 'Mistakes Analyzed' },
              { id: 'synonyms_completed', label: 'Synonyms Completed' }
            ].map(task => (
              <button 
                key={task.id}
                onClick={() => updateProgress({ [task.id]: !progress?.[task.id] })}
                className="flex items-center gap-3 w-full p-2 hover:bg-[var(--border)] rounded-lg transition-colors text-left"
              >
                {progress?.[task.id] 
                  ? <CheckCircle2 className="text-purple-500" /> 
                  : <Circle className="text-[var(--text-sec)]" />}
                <span className={progress?.[task.id] ? 'line-through text-[var(--text-sec)]' : ''}>
                  {task.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Daily Vocabulary */}
        <section className="glass-card p-6 lg:col-span-4">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Word of the Day</h2>
          {vocab?.words ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocab.words.map((w: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-[var(--border)] border border-transparent hover:border-[#2997FF] transition-all">
                  <h3 className="font-bold text-lg text-[#2997FF]">{w.word}</h3>
                  <p className="text-sm font-medium mt-1">{w.meaning}</p>
                  <p className="text-sm text-[var(--text-sec)] mt-2 italic">"{w.example}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[var(--text-sec)]">Loading vocabulary from Gemini...</div>
          )}
        </section>

      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Flame, Clock, TrendingUp, Scissors } from 'lucide-react';

export default function StatsHeader({ clips, videoTitle }) {
    const avgScore = Math.round(clips.reduce((acc, c) => acc + c.viralScore, 0) / clips.length);
    const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);
    const topClips = clips.filter(c => c.viralScore >= 80).length;

    const stats = [
        { icon: Scissors, label: 'Clips Found', value: clips.length, color: 'text-purple-400' },
        { icon: Flame, label: 'Avg. Viral Score', value: avgScore, color: 'text-orange-400' },
        { icon: TrendingUp, label: 'Top Potential', value: topClips, color: 'text-emerald-400' },
        { icon: Clock, label: 'Total Content', value: `${Math.round(totalDuration / 60)}m`, color: 'text-pink-400' }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            <div className="text-center mb-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full mb-4"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-400">Analysis Complete</span>
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2 max-w-4xl mx-auto">
                    {videoTitle}
                </h2>
                <p className="text-slate-400">Here are the most viral-worthy moments from your video</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 text-center"
                        >
                            <Icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
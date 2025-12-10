import { motion } from 'framer-motion';

export default function RatingBar({ label, value, icon: Icon, delay = 0 }) {
    const getBarColor = (v) => {
        if (v >= 85) return 'from-emerald-500 to-emerald-400';
        if (v >= 70) return 'from-purple-500 to-pink-500';
        if (v >= 50) return 'from-amber-500 to-orange-400';
        return 'from-red-500 to-red-400';
    };

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    <span className="text-xs font-medium text-slate-300">{label}</span>
                </div>
                <span className="text-xs font-semibold text-white">{value}</span>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor(value)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.8, delay, ease: "easeOut" }}
                    style={{
                        boxShadow: '0 0 10px rgba(139, 92, 246, 0.3)'
                    }}
                />
            </div>
        </div>
    );
}
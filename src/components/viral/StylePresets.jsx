import { motion } from 'framer-motion';
import { Zap, GraduationCap, Heart, Laugh, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const presets = [
    {
        id: 'fast_paced',
        name: 'Fast-Paced Action',
        icon: Zap,
        description: 'High-energy clips with quick cuts and dynamic moments',
        color: 'from-orange-500 to-red-500',
        borderColor: 'border-orange-500/50',
        bgColor: 'bg-orange-500/10',
        iconColor: 'text-orange-400'
    },
    {
        id: 'educational',
        name: 'Educational Explainer',
        icon: GraduationCap,
        description: 'Clear, informative segments with valuable insights',
        color: 'from-blue-500 to-cyan-500',
        borderColor: 'border-blue-500/50',
        bgColor: 'bg-blue-500/10',
        iconColor: 'text-blue-400'
    },
    {
        id: 'emotional',
        name: 'Emotional Storytelling',
        icon: Heart,
        description: 'Heartfelt moments that connect and inspire',
        color: 'from-pink-500 to-rose-500',
        borderColor: 'border-pink-500/50',
        bgColor: 'bg-pink-500/10',
        iconColor: 'text-pink-400'
    },
    {
        id: 'comedy',
        name: 'Comedy Skit',
        icon: Laugh,
        description: 'Funny, entertaining clips that make people laugh',
        color: 'from-yellow-500 to-amber-500',
        borderColor: 'border-yellow-500/50',
        bgColor: 'bg-yellow-500/10',
        iconColor: 'text-yellow-400'
    },
    {
        id: 'trending',
        name: 'Trend-Focused',
        icon: TrendingUp,
        description: 'Clips aligned with current viral trends',
        color: 'from-purple-500 to-pink-500',
        borderColor: 'border-purple-500/50',
        bgColor: 'bg-purple-500/10',
        iconColor: 'text-purple-400'
    },
    {
        id: 'balanced',
        name: 'Balanced Mix',
        icon: Sparkles,
        description: 'Diverse selection covering all engagement types',
        color: 'from-slate-500 to-slate-600',
        borderColor: 'border-slate-500/50',
        bgColor: 'bg-slate-500/10',
        iconColor: 'text-slate-400'
    }
];

export default function StylePresets({ selectedStyle, onStyleChange }) {
    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Choose Your Style</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">How should we analyze your video?</h3>
                <p className="text-sm text-slate-400">Select a style to tailor the AI's clip detection and scoring</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset, index) => {
                    const Icon = preset.icon;
                    const isSelected = selectedStyle === preset.id;

                    return (
                        <motion.button
                            key={preset.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onStyleChange(preset.id)}
                            className={cn(
                                "relative group text-left p-5 rounded-xl border-2 transition-all duration-300",
                                "hover:scale-105 hover:shadow-lg",
                                isSelected 
                                    ? `${preset.borderColor} ${preset.bgColor} shadow-lg` 
                                    : "border-slate-700/50 bg-slate-800/50 hover:border-slate-600"
                            )}
                        >
                            {isSelected && (
                                <motion.div
                                    layoutId="selected-style"
                                    className={`absolute inset-0 bg-gradient-to-r ${preset.color} opacity-10 rounded-xl`}
                                    transition={{ type: "spring", duration: 0.5 }}
                                />
                            )}

                            <div className="relative">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all",
                                    isSelected 
                                        ? `bg-gradient-to-r ${preset.color}` 
                                        : "bg-slate-700 group-hover:bg-slate-600"
                                )}>
                                    <Icon className={cn(
                                        "w-6 h-6",
                                        isSelected ? "text-white" : preset.iconColor
                                    )} />
                                </div>

                                <h4 className={cn(
                                    "font-semibold mb-1.5 transition-colors",
                                    isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                                )}>
                                    {preset.name}
                                </h4>

                                <p className={cn(
                                    "text-sm transition-colors",
                                    isSelected ? "text-slate-300" : "text-slate-400"
                                )}>
                                    {preset.description}
                                </p>

                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={`absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-r ${preset.color} flex items-center justify-center`}
                                    >
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

export { presets };
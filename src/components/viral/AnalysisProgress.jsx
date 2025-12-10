import { motion } from 'framer-motion';
import { Brain, Scissors, Sparkles, BarChart3 } from 'lucide-react';

const steps = [
    { icon: Brain, label: 'Processing Video', description: 'Understanding video context...' },
    { icon: Scissors, label: 'Finding Clips', description: 'Detecting engaging moments...' },
    { icon: Sparkles, label: 'Scoring Virality', description: 'Calculating viral potential...' },
    { icon: BarChart3, label: 'Ranking Results', description: 'Preparing your clips...' }
];

export default function AnalysisProgress({ currentStep }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl mx-auto"
        >
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <Brain className="w-10 h-10 text-white" />
                            </motion.div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mt-6">AI Analysis in Progress</h3>
                    <p className="text-slate-400 mt-2">This usually takes 30-60 seconds</p>
                </div>

                <div className="space-y-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isComplete = index < currentStep;

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                                    isActive ? 'bg-purple-500/20 border border-purple-500/30' : 
                                    isComplete ? 'bg-slate-700/30' : 'bg-slate-800/30'
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                    isActive ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                    isComplete ? 'bg-emerald-500' : 'bg-slate-700'
                                }`}>
                                    <Icon className={`w-5 h-5 ${isActive || isComplete ? 'text-white' : 'text-slate-500'}`} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${isActive || isComplete ? 'text-white' : 'text-slate-500'}`}>
                                        {step.label}
                                    </p>
                                    <p className={`text-sm ${isActive ? 'text-purple-300' : 'text-slate-500'}`}>
                                        {step.description}
                                    </p>
                                </div>
                                {isActive && (
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-2 h-2 rounded-full bg-purple-400"
                                    />
                                )}
                                {isComplete && (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
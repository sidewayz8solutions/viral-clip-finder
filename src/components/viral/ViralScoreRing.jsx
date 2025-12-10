import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ViralScoreRing({ score, size = 80, strokeWidth = 6 }) {
    const [animatedScore, setAnimatedScore] = useState(0);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedScore / 100) * circumference;

    useEffect(() => {
        const timer = setTimeout(() => setAnimatedScore(score), 100);
        return () => clearTimeout(timer);
    }, [score]);

    const getScoreColor = (s) => {
        if (s >= 85) return '#10b981';
        if (s >= 70) return '#8b5cf6';
        if (s >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreLabel = (s) => {
        if (s >= 85) return 'VIRAL';
        if (s >= 70) return 'HIGH';
        if (s >= 50) return 'MEDIUM';
        return 'LOW';
    };

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getScoreColor(score)}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${getScoreColor(score)}50)`
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <motion.span 
                    className="text-xl font-bold text-white"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                >
                    {score}
                </motion.span>
                <span 
                    className="text-[9px] font-semibold tracking-wider"
                    style={{ color: getScoreColor(score) }}
                >
                    {getScoreLabel(score)}
                </span>
            </div>
        </div>
    );
}
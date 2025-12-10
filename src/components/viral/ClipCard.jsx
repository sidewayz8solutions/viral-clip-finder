import { motion } from 'framer-motion';
import { Clock, Sparkles, TrendingUp, MessageCircle, Share2, Zap, Play, Download, Copy, Check, ExternalLink, Heart, Eye, Type, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ViralScoreRing from './ViralScoreRing';
import RatingBar from './RatingBar';
import QuickShareMenu from './QuickShareMenu';
import { useState } from 'react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ClipCard({ clip, index, onExport, videoTitle }) {
    const [copied, setCopied] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false);
    const queryClient = useQueryClient();

    const saveClipMutation = useMutation({
        mutationFn: (data) => base44.entities.SavedClip.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['savedClips']);
            setIsFavorited(true);
            toast.success('Clip saved to favorites!');
        },
    });

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const copyTimestamps = () => {
        navigator.clipboard.writeText(`${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}`);
        setCopied(true);
        toast.success('Timestamps copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveClip = () => {
        saveClipMutation.mutate({
            clip_title: clip.title,
            clip_data: clip,
            video_title: videoTitle,
            saved_at: new Date().toISOString()
        });
    };

    const getTrendBadge = () => {
        if (clip.trendScore >= 85) return { label: '🔥 Trending Potential', variant: 'default', className: 'bg-gradient-to-r from-orange-500 to-red-500 border-0' };
        if (clip.trendScore >= 70) return { label: '⚡ High Engagement', variant: 'default', className: 'bg-gradient-to-r from-purple-500 to-pink-500 border-0' };
        if (clip.trendScore >= 50) return { label: '✨ Good Hook', variant: 'default', className: 'bg-slate-600 border-0' };
        return null;
    };

    const trendBadge = getTrendBadge();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-purple-500/30 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-slate-500">CLIP #{index + 1}</span>
                            {trendBadge && (
                                <Badge className={`text-xs ${trendBadge.className}`}>
                                    {trendBadge.label}
                                </Badge>
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-white leading-tight mb-2">
                            {clip.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(clip.startTime)} - {formatTime(clip.endTime)}</span>
                            </div>
                            <span className="text-slate-600">•</span>
                            <span>{clip.duration}s</span>
                        </div>
                    </div>
                    <ViralScoreRing score={clip.viralScore} />
                </div>

                {/* Content Analysis */}
                {(clip.sceneDescription || clip.keyElements) && (
                    <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/30">
                        <div className="flex items-center gap-2 mb-3">
                            <Eye className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-medium text-cyan-400">CONTENT ANALYSIS</span>
                        </div>

                        {clip.sceneDescription && (
                            <p className="text-sm text-slate-300 mb-3 leading-relaxed">
                                {clip.sceneDescription}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {clip.contentType && (
                                <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-md border border-purple-500/30">
                                    {clip.contentType.replace('_', ' ')}
                                </span>
                            )}
                            {clip.emotionalTone && (
                                <span className="px-2 py-1 text-xs bg-pink-500/20 text-pink-300 rounded-md border border-pink-500/30">
                                    {clip.emotionalTone}
                                </span>
                            )}
                            {clip.hasDialogue && (
                                <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30 flex items-center gap-1">
                                    <MessageCircle className="w-3 h-3" />
                                    dialogue
                                </span>
                            )}
                            {clip.hasOnScreenText && (
                                <span className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded-md border border-amber-500/30 flex items-center gap-1">
                                    <Type className="w-3 h-3" />
                                    text
                                </span>
                            )}
                            {clip.hasVisualDemo && (
                                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-md border border-green-500/30 flex items-center gap-1">
                                    <Video className="w-3 h-3" />
                                    demo
                                </span>
                            )}
                        </div>

                        {clip.keyElements && clip.keyElements.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50">
                                <div className="flex flex-wrap gap-1.5">
                                    {clip.keyElements.map((element, i) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-slate-700/50 text-slate-400 rounded">
                                            {element}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Preview Transcript */}
                <div className="bg-slate-900/50 rounded-xl p-4 mb-4 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-medium text-purple-400">HOOK PREVIEW</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                        "{clip.transcript}"
                    </p>
                </div>

                {/* Ratings Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <RatingBar 
                        label="Hook Strength" 
                        value={clip.hookStrength} 
                        icon={Zap}
                        delay={0.1}
                    />
                    <RatingBar 
                        label="Engagement" 
                        value={clip.engagement} 
                        icon={TrendingUp}
                        delay={0.2}
                    />
                    <RatingBar 
                        label="Shareability" 
                        value={clip.shareability} 
                        icon={Share2}
                        delay={0.3}
                    />
                    <RatingBar 
                        label="Trend Alignment" 
                        value={clip.trendScore} 
                        icon={Sparkles}
                        delay={0.4}
                    />
                </div>

                {/* Why It Works */}
                <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">WHY IT WORKS</span>
                    </div>
                    <p className="text-sm text-slate-400">{clip.whyItWorks}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {clip.suggestedHashtags.map((tag, i) => (
                        <span 
                            key={i}
                            className="px-2.5 py-1 text-xs font-medium bg-slate-700/50 text-slate-300 rounded-full hover:bg-purple-500/20 hover:text-purple-300 transition-colors cursor-pointer"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button 
                        className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0"
                        onClick={() => onExport(clip)}
                    >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Export Clip
                    </Button>
                    <QuickShareMenu clip={clip} onOpenExport={() => onExport(clip)} />
                    <Button 
                        variant="outline" 
                        className={isFavorited ? "border-pink-500 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400" : "border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white"}
                        onClick={handleSaveClip}
                        disabled={isFavorited}
                    >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </Button>
                    <Button 
                        variant="outline" 
                        className="border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white"
                        onClick={copyTimestamps}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
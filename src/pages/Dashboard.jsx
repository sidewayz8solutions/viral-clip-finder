import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Sparkles, ArrowDown, Filter, SortDesc, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster, toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import VideoInput from '@/components/viral/VideoInput';
import ClipCard from '@/components/viral/ClipCard';
import AnalysisProgress from '@/components/viral/AnalysisProgress';
import StatsHeader from '@/components/viral/StatsHeader';
import ExportModal from '@/components/viral/ExportModal';
import VideoEditorModal from '@/components/viral/VideoEditorModal.jsx';
import StylePresets from '@/components/viral/StylePresets';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Dashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [clips, setClips] = useState([]);
    const [videoTitle, setVideoTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [sortBy, setSortBy] = useState('viralScore');
    const [filterBy, setFilterBy] = useState('all');
    const [contentFilter, setContentFilter] = useState('all');
    const [emotionFilter, setEmotionFilter] = useState('all');
    const [selectedClipForExport, setSelectedClipForExport] = useState(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState('balanced');
    const [showStyleSelector, setShowStyleSelector] = useState(true);
    const [user, setUser] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                console.log('User not logged in');
            }
        };
        loadUser();
    }, []);

    const { data: preferences = [] } = useQuery({
        queryKey: ['preferences', user?.id],
        queryFn: () => base44.entities.UserPreference.filter({ created_by: user?.email }),
        enabled: !!user,
    });

    useEffect(() => {
        if (preferences[0]?.default_style_preset) {
            setSelectedStyle(preferences[0].default_style_preset);
        }
    }, [preferences]);

    const saveHistoryMutation = useMutation({
        mutationFn: (data) => base44.entities.AnalysisHistory.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['history']);
        },
    });

    const getStylePromptModifier = (style) => {
        const modifiers = {
            fast_paced: {
                focus: 'Focus on high-energy, action-packed moments with dynamic content. Prioritize clips with quick pacing, exciting reveals, or intense moments. Titles should be punchy and use action verbs. Hashtags should emphasize energy and intensity.',
                scoringBias: 'Rate hookStrength and engagement extra high (add 10-15 points) for clips with rapid pacing or exciting moments.',
                titleStyle: 'Use powerful action verbs and exclamation marks. Keep it punchy and energetic.',
                hashtags: '#FastPaced #Action #Intense #HighEnergy #Adrenaline #Explosive #Dynamic #Rapid'
            },
            educational: {
                focus: 'Focus on clear, informative segments with valuable insights and learning moments. Prioritize clips that explain concepts, share knowledge, or provide useful tips. Titles should be clear and informative. Hashtags should emphasize learning and value.',
                scoringBias: 'Rate hookStrength higher (add 10 points) for clips with "Did you know" moments or clear explanations. Value clarity over flash.',
                titleStyle: 'Use clear, benefit-driven titles that promise learning (e.g., "How to...", "Why...", "The Secret to...").',
                hashtags: '#LearnOnTikTok #Educational #DidYouKnow #Tutorial #HowTo #Knowledge #Tips #Explained'
            },
            emotional: {
                focus: 'Focus on heartfelt, emotionally resonant moments that connect with viewers. Prioritize clips with personal stories, inspiring moments, or emotional depth. Titles should evoke feelings. Hashtags should emphasize connection and inspiration.',
                scoringBias: 'Rate shareability and engagement extra high (add 15 points) for emotionally powerful moments. Look for authenticity.',
                titleStyle: 'Use emotionally evocative language that creates curiosity and connection.',
                hashtags: '#Heartfelt #Emotional #Inspiring #Real #Stories #Authentic #TouchingMoment #FeelGood'
            },
            comedy: {
                focus: 'Focus on funny, entertaining moments that make people laugh. Prioritize clips with jokes, comedic timing, unexpected twists, or humorous situations. Titles should be witty or intriguing. Hashtags should emphasize humor.',
                scoringBias: 'Rate shareability extra high (add 15 points) for genuinely funny moments. Prioritize unexpected humor and relatability.',
                titleStyle: 'Use humor, irony, or curiosity-inducing titles. Make them witty and shareable.',
                hashtags: '#Comedy #Funny #LOL #Hilarious #Humor #Jokes #Entertainment #ComedyGold'
            },
            trending: {
                focus: 'Focus on clips that align with current viral trends, popular formats, and trending topics. Prioritize moments that fit trending audio, challenges, or viral patterns. Hashtags must include current trending tags.',
                scoringBias: 'Rate trendScore significantly higher (add 20 points). Heavily prioritize content that matches viral patterns.',
                titleStyle: 'Use trending phrases and formats. Reference popular memes or viral moments when applicable.',
                hashtags: '#Trending #Viral #ForYou #FYP #TrendingNow #ViralVideo #Trending2024 #PopularNow'
            },
            balanced: {
                focus: 'Create a diverse selection covering different engagement types: educational moments, emotional hooks, entertaining segments, and trending elements. Aim for variety.',
                scoringBias: 'Use balanced scoring across all metrics. Ensure diversity in clip types.',
                titleStyle: 'Use varied title styles appropriate to each clip\'s content.',
                hashtags: '#Viral #Content #Shorts #Reels #ForYou #TikTok #Engaging #MustWatch'
            }
        };

        return modifiers[style] || modifiers.balanced;
    };

    const analyzeVideo = async (input) => {
        setIsLoading(true);
        setClips([]);
        setAnalysisStep(0);
        setShowStyleSelector(false);

        // Simulate progress steps
        const stepInterval = setInterval(() => {
            setAnalysisStep(prev => {
                if (prev < 3) return prev + 1;
                clearInterval(stepInterval);
                return prev;
            });
        }, 2000);

        try {
            let fileUrl = null;
            let promptContext = '';

            // Handle file upload
            if (input.type === 'file') {
                toast.info('Uploading video...');
                const uploadResult = await base44.integrations.Core.UploadFile({
                    file: input.data
                });
                fileUrl = uploadResult.file_url;
                promptContext = `You are an expert viral content strategist. Analyze the uploaded video file.

The video filename is: ${input.data.name}`;
            } else {
                // Handle YouTube URL
                promptContext = `You are an expert viral content strategist. Analyze this YouTube video URL: ${input.data}`;
            }

            // Get style-specific instructions
            const styleModifier = getStylePromptModifier(selectedStyle);

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `${promptContext}

STYLE DIRECTIVE: ${styleModifier.focus}

SCORING BIAS: ${styleModifier.scoringBias}

TITLE STYLE: ${styleModifier.titleStyle}

HASHTAG GUIDANCE: Incorporate these style-appropriate hashtags: ${styleModifier.hashtags}

Imagine you've watched the full video. Generate 6-8 potential viral short-form clips that would perform well on TikTok, Instagram Reels, and YouTube Shorts, tailored to the style directive above.

For each clip, provide:
1. A catchy, hook-driven title
2. Start and end timestamps (in seconds, realistic for a 10-20 minute video)
3. Duration (15-60 seconds ideal for shorts)
4. A compelling transcript excerpt that shows the hook
5. Detailed ratings (0-100):
   - viralScore: Overall viral potential
   - hookStrength: How strong is the opening hook
   - engagement: Likelihood of comments, shares, saves
   - shareability: How likely people will send to friends
   - trendScore: Alignment with current social media trends
6. A brief explanation of why this clip would work
7. 4-5 suggested hashtags
8. CONTENT ANALYSIS - Identify and categorize content elements:
   - hasDialogue: Is there spoken dialogue? (boolean)
   - hasOnScreenText: Any text visible on screen? (boolean)
   - contentType: Primary type (dialogue, tutorial, product_demo, reaction, storytelling, visual, text_based)
   - emotionalTone: Dominant emotion (excited, calm, funny, dramatic, inspirational, educational, suspenseful)
   - hasVisualDemo: Shows visual demonstration or action? (boolean)
   - keyElements: Array of specific elements present (e.g., ["face closeup", "product showcase", "before/after", "text overlay", "background music", "fast cuts"])
   - sceneDescription: Brief description of what's visually happening

Make the clips diverse: include educational moments, emotional hooks, controversial takes, funny moments, and quotable lines. Be realistic with timestamps.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        videoTitle: { type: "string", description: "Inferred or extracted video title" },
                        clips: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    startTime: { type: "number" },
                                    endTime: { type: "number" },
                                    duration: { type: "number" },
                                    transcript: { type: "string" },
                                    viralScore: { type: "number" },
                                    hookStrength: { type: "number" },
                                    engagement: { type: "number" },
                                    shareability: { type: "number" },
                                    trendScore: { type: "number" },
                                    whyItWorks: { type: "string" },
                                    suggestedHashtags: { type: "array", items: { type: "string" } },
                                    hasDialogue: { type: "boolean" },
                                    hasOnScreenText: { type: "boolean" },
                                    contentType: { type: "string" },
                                    emotionalTone: { type: "string" },
                                    hasVisualDemo: { type: "boolean" },
                                    keyElements: { type: "array", items: { type: "string" } },
                                    sceneDescription: { type: "string" }
                                }
                            }
                        }
                    }
                },
                file_urls: fileUrl ? [fileUrl] : undefined
            });

            clearInterval(stepInterval);
            setAnalysisStep(4);
            
            setTimeout(() => {
                const title = result.videoTitle || (input.type === 'file' ? input.data.name : "Analyzed Video");
                const url = input.type === 'url' ? input.data : fileUrl;
                
                setVideoTitle(title);
                setVideoUrl(url);
                setClips(result.clips || []);
                setIsLoading(false);
                toast.success(`Found ${result.clips?.length || 0} viral clips!`);

                // Save to history if user is logged in and auto-save is enabled
                if (user && (preferences[0]?.auto_save_analyses ?? true)) {
                    saveHistoryMutation.mutate({
                        video_title: title,
                        video_url: url,
                        source_type: input.type === 'url' ? 'youtube' : 'upload',
                        style_preset: selectedStyle,
                        clips_found: result.clips?.length || 0,
                        clips_data: result.clips || [],
                        analyzed_at: new Date().toISOString()
                    });
                }
            }, 500);
        } catch (error) {
            clearInterval(stepInterval);
            setIsLoading(false);
            toast.error('Failed to analyze video. Please try again.');
            console.error('Analysis error:', error);
        }
    };

    const handleExportClip = (clip) => {
        setSelectedClipForExport(clip);
        setIsExportModalOpen(true);
    };

    const handleStyleChange = (style) => {
        setSelectedStyle(style);
        setShowStyleSelector(false);
    };

    const resetToStyleSelector = () => {
        setClips([]);
        setVideoTitle('');
        setShowStyleSelector(true);
    };

    const sortedAndFilteredClips = () => {
        let result = [...clips];

        // Viral score filter
        if (filterBy === 'high') {
            result = result.filter(c => c.viralScore >= 80);
        } else if (filterBy === 'medium') {
            result = result.filter(c => c.viralScore >= 50 && c.viralScore < 80);
        }

        // Content type filter
        if (contentFilter !== 'all') {
            if (contentFilter === 'dialogue') {
                result = result.filter(c => c.hasDialogue);
            } else if (contentFilter === 'text') {
                result = result.filter(c => c.hasOnScreenText);
            } else if (contentFilter === 'visual_demo') {
                result = result.filter(c => c.hasVisualDemo);
            } else {
                result = result.filter(c => c.contentType === contentFilter);
            }
        }

        // Emotional tone filter
        if (emotionFilter !== 'all') {
            result = result.filter(c => c.emotionalTone === emotionFilter);
        }

        result.sort((a, b) => b[sortBy] - a[sortBy]);
        return result;
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
            </div>

            <Toaster theme="dark" position="top-center" />

            {/* Content */}
            <div className="relative z-10 px-4 py-12 md:py-20">
                <div className="max-w-6xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                        >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex-1" />
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-purple-300">AI-Powered Clip Detection</span>
                            </div>
                            <div className="flex-1 flex justify-end gap-2">
                                <Link to={createPageUrl('ScriptGenerator')}>
                                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Script Generator
                                    </Button>
                                </Link>
                                <Link to={createPageUrl('Profile')}>
                                    <Button variant="ghost" className="text-slate-400 hover:text-white">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Turn Long Videos Into
                            <br />
                            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Viral Short Clips
                            </span>
                        </h1>
                        
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                            Upload your video or paste a YouTube URL and our AI will find the most engaging, 
                            shareable moments perfect for TikTok, Reels & Shorts.
                        </p>
                    </motion.div>

                    {/* Video Input */}
                    {!isLoading && clips.length === 0 && (
                        <VideoInput onAnalyze={analyzeVideo} isLoading={isLoading} />
                    )}

                    {/* Analysis Progress */}
                    <AnimatePresence mode="wait">
                        {isLoading && (
                            <AnalysisProgress currentStep={analysisStep} />
                        )}
                    </AnimatePresence>

                    {/* Results */}
                    {clips.length > 0 && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <StatsHeader clips={clips} videoTitle={videoTitle} />

                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 mb-6">
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={resetToStyleSelector}
                                        className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-white"
                                    >
                                        <Scissors className="w-4 h-4 mr-2" />
                                        Analyze New Video
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowStyleSelector(true)}
                                        className="border-purple-600/50 bg-purple-900/20 hover:bg-purple-800/30 text-purple-300"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Change Style
                                    </Button>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-slate-400" />
                                        <Select value={filterBy} onValueChange={setFilterBy}>
                                            <SelectTrigger className="w-32 bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="all">All Scores</SelectItem>
                                                <SelectItem value="high">High Potential</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Select value={contentFilter} onValueChange={setContentFilter}>
                                        <SelectTrigger className="w-40 bg-slate-800 border-slate-700 text-white">
                                            <SelectValue placeholder="Content Type" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Content</SelectItem>
                                            <SelectItem value="dialogue">With Dialogue</SelectItem>
                                            <SelectItem value="text">With Text</SelectItem>
                                            <SelectItem value="visual_demo">Visual Demo</SelectItem>
                                            <SelectItem value="tutorial">Tutorial</SelectItem>
                                            <SelectItem value="product_demo">Product Demo</SelectItem>
                                            <SelectItem value="reaction">Reaction</SelectItem>
                                            <SelectItem value="storytelling">Storytelling</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={emotionFilter} onValueChange={setEmotionFilter}>
                                        <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
                                            <SelectValue placeholder="Emotion" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700">
                                            <SelectItem value="all">All Emotions</SelectItem>
                                            <SelectItem value="excited">Excited</SelectItem>
                                            <SelectItem value="funny">Funny</SelectItem>
                                            <SelectItem value="educational">Educational</SelectItem>
                                            <SelectItem value="inspirational">Inspirational</SelectItem>
                                            <SelectItem value="dramatic">Dramatic</SelectItem>
                                            <SelectItem value="calm">Calm</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="flex items-center gap-2">
                                        <SortDesc className="w-4 h-4 text-slate-400" />
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="viralScore">Viral Score</SelectItem>
                                                <SelectItem value="hookStrength">Hook Strength</SelectItem>
                                                <SelectItem value="engagement">Engagement</SelectItem>
                                                <SelectItem value="shareability">Shareability</SelectItem>
                                                <SelectItem value="trendScore">Trend Score</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Clips Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {sortedAndFilteredClips().map((clip, index) => (
                                    <ClipCard 
                                        key={index} 
                                        clip={clip} 
                                        index={index}
                                        onExport={handleExportClip}
                                        videoTitle={videoTitle}
                                    />
                                ))}
                            </div>

                            {sortedAndFilteredClips().length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-slate-400">No clips match the current filter.</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Features Section - only show on initial state */}
                    {!isLoading && clips.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="mt-20"
                        >
                            <div className="flex justify-center mb-8">
                                <ArrowDown className="w-6 h-6 text-slate-500 animate-bounce" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                {[
                                    { 
                                        title: 'AI Style Presets', 
                                        description: 'Choose from 6 different styles to tailor clip detection, titles, and hashtags to your content type.',
                                        gradient: 'from-purple-500 to-pink-500'
                                    },
                                    { 
                                        title: 'Direct Video Upload', 
                                        description: 'Upload your own videos directly - no need for YouTube. MP4, MOV, AVI, and more supported.',
                                        gradient: 'from-pink-500 to-orange-500'
                                    },
                                    { 
                                        title: 'Smart Analysis', 
                                        description: 'Multi-metric scoring adapts to your chosen style, finding the perfect clips for your content goals.',
                                        gradient: 'from-orange-500 to-amber-500'
                                    }
                                ].map((feature, index) => (
                                    <motion.div
                                        key={feature.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 text-center hover:border-purple-500/30 transition-colors"
                                    >
                                        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center`}>
                                            <Sparkles className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                        <p className="text-sm text-slate-400">{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Export Modal */}
            <ExportModal
                clip={selectedClipForExport}
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                videoUrl={videoUrl}
                onOpenEditor={() => setIsEditorModalOpen(true)}
            />

            {/* Video Editor Modal */}
            <VideoEditorModal
                clip={selectedClipForExport}
                isOpen={isEditorModalOpen}
                onClose={() => setIsEditorModalOpen(false)}
                videoUrl={videoUrl}
                stylePreset={selectedStyle}
            />
        </div>
    );
}
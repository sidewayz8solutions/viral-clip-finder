import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Download, Share2, Copy, Check, ExternalLink,
    MessageCircle, Instagram, Youtube, Sparkles, Link2, Wand2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ExportModal({ clip, isOpen, onClose, videoUrl, onOpenEditor }) {
    const [copied, setCopied] = useState(false);
    const [shareableLink, setShareableLink] = useState('');
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const generateSocialMediaCaption = (platform) => {
        const hashtagsText = clip.suggestedHashtags.map(tag => `#${tag}`).join(' ');
        
        const captions = {
            tiktok: `${clip.title}

${clip.transcript.substring(0, 150)}...

${hashtagsText}`,
            instagram: `${clip.title}

${clip.transcript.substring(0, 200)}...

${hashtagsText}

---
✨ Created with ViralClip AI`,
            youtube: `${clip.title}

${clip.transcript}

Why this works: ${clip.whyItWorks}

${hashtagsText}

#Shorts #Viral`
        };

        return captions[platform];
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadClip = () => {
        toast.info('Video processing feature coming soon!', {
            description: 'Direct MP4 export requires backend processing. This feature will be available when backend functions are enabled.'
        });
    };

    const generateShareableLink = async () => {
        setIsGeneratingLink(true);
        
        // Simulate link generation
        setTimeout(() => {
            const clipId = Math.random().toString(36).substring(7);
            const link = `${window.location.origin}/clip/${clipId}`;
            setShareableLink(link);
            setIsGeneratingLink(false);
            toast.success('Shareable link generated!');
        }, 1000);
    };

    const handleDirectShare = (platform) => {
        const caption = generateSocialMediaCaption(platform);
        copyToClipboard(caption);
        
        const platformUrls = {
            tiktok: 'https://www.tiktok.com/upload',
            instagram: 'https://www.instagram.com/create/story/',
            youtube: 'https://studio.youtube.com/channel/UC/videos/upload?d=ud'
        };

        toast.info(`Opening ${platform}...`, {
            description: 'Caption copied! Paste it when uploading your clip.'
        });

        setTimeout(() => {
            window.open(platformUrls[platform], '_blank');
        }, 1000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Export Clip</h2>
                                <p className="text-sm text-slate-400">{clip.title}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <Tabs defaultValue="editor" className="w-full">
                            <TabsList className="grid w-full grid-cols-4 bg-slate-800 mb-6">
                                <TabsTrigger value="editor">
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    AI Editor
                                </TabsTrigger>
                                <TabsTrigger value="download">
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                </TabsTrigger>
                                <TabsTrigger value="share">
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Share Link
                                </TabsTrigger>
                                <TabsTrigger value="social">
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Social Media
                                </TabsTrigger>
                            </TabsList>

                            {/* AI Editor Tab */}
                            <TabsContent value="editor" className="space-y-4">
                                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
                                    <div className="text-center mb-6">
                                        <Wand2 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                                        <h3 className="text-xl font-bold text-white mb-2">AI-Powered Video Editor</h3>
                                        <p className="text-slate-400">
                                            Transform your clip with automatic editing, captions, effects, and music
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="w-4 h-4 text-purple-400" />
                                                <h4 className="font-semibold text-white text-sm">Auto-Edit & Effects</h4>
                                            </div>
                                            <p className="text-xs text-slate-400">Dynamic cuts, transitions, and style-based effects</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle className="w-4 h-4 text-blue-400" />
                                                <h4 className="font-semibold text-white text-sm">AI Captions</h4>
                                            </div>
                                            <p className="text-xs text-slate-400">Auto-generated subtitles in viral styles</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Download className="w-4 h-4 text-green-400" />
                                                <h4 className="font-semibold text-white text-sm">Custom Parameters</h4>
                                            </div>
                                            <p className="text-xs text-slate-400">Adjust speed, aspect ratio, text overlays</p>
                                        </div>

                                        <div className="bg-slate-800/50 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Youtube className="w-4 h-4 text-pink-400" />
                                                <h4 className="font-semibold text-white text-sm">Trending Music</h4>
                                            </div>
                                            <p className="text-xs text-slate-400">Royalty-free background music by style</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => {
                                            onClose();
                                            onOpenEditor();
                                        }}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6"
                                    >
                                        <Wand2 className="w-5 h-5 mr-2" />
                                        Open AI Video Editor
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Download Tab */}
                            <TabsContent value="download" className="space-y-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                        <h3 className="font-semibold text-white">Clip Details</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-slate-400">Duration:</span>
                                            <span className="text-white ml-2">{clip.duration}s</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Viral Score:</span>
                                            <span className="text-white ml-2">{clip.viralScore}/100</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Start:</span>
                                            <span className="text-white ml-2">{formatTime(clip.startTime)}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">End:</span>
                                            <span className="text-white ml-2">{formatTime(clip.endTime)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                                    <div className="flex gap-3">
                                        <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="text-amber-200 font-medium mb-1">Backend Processing Required</p>
                                            <p className="text-amber-300/80">
                                                Direct MP4 export requires video processing capabilities. Enable backend functions in your app settings to unlock this feature.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handleDownloadClip}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6"
                                    >
                                        <Download className="w-5 h-5 mr-2" />
                                        Download as MP4
                                    </Button>

                                    <div className="text-center text-sm text-slate-500">
                                        or copy timestamps manually
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => copyToClipboard(`${formatTime(clip.startTime)} - ${formatTime(clip.endTime)}`)}
                                        className="w-full border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                                    >
                                        {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                        Copy Timestamps
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Share Link Tab */}
                            <TabsContent value="share" className="space-y-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <h3 className="font-semibold text-white mb-3">Shareable Link</h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        Generate a link that includes the video preview, viral scores, and suggested hashtags.
                                    </p>

                                    {!shareableLink ? (
                                        <Button
                                            onClick={generateShareableLink}
                                            disabled={isGeneratingLink}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                        >
                                            {isGeneratingLink ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    >
                                                        <Sparkles className="w-4 h-4 mr-2" />
                                                    </motion.div>
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="w-4 h-4 mr-2" />
                                                    Generate Shareable Link
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex gap-2">
                                                <Input
                                                    value={shareableLink}
                                                    readOnly
                                                    className="bg-slate-900 border-slate-600 text-white"
                                                />
                                                <Button
                                                    onClick={() => copyToClipboard(shareableLink)}
                                                    className="bg-slate-700 hover:bg-slate-600"
                                                >
                                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(shareableLink, '_blank')}
                                                className="w-full border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open Preview
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                                    <h3 className="font-semibold text-white mb-3">What's Included</h3>
                                    <ul className="space-y-2 text-sm text-slate-400">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Video preview with timestamp markers
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Complete viral metrics and scores
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            Suggested hashtags and caption
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                            "Why it works" explanation
                                        </li>
                                    </ul>
                                </div>
                            </TabsContent>

                            {/* Social Media Tab */}
                            <TabsContent value="social" className="space-y-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-4">
                                    <h3 className="font-semibold text-white mb-2">Quick Share</h3>
                                    <p className="text-sm text-slate-400">
                                        Copy pre-formatted captions for each platform and open the upload page.
                                    </p>
                                </div>

                                {/* Platform Buttons */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Button
                                        onClick={() => handleDirectShare('tiktok')}
                                        className="bg-black hover:bg-black/80 text-white py-6 flex-col h-auto"
                                    >
                                        <MessageCircle className="w-6 h-6 mb-2" />
                                        <span className="font-semibold">TikTok</span>
                                        <span className="text-xs opacity-70">Copy & Upload</span>
                                    </Button>

                                    <Button
                                        onClick={() => handleDirectShare('instagram')}
                                        className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white py-6 flex-col h-auto"
                                    >
                                        <Instagram className="w-6 h-6 mb-2" />
                                        <span className="font-semibold">Instagram</span>
                                        <span className="text-xs opacity-70">Reels</span>
                                    </Button>

                                    <Button
                                        onClick={() => handleDirectShare('youtube')}
                                        className="bg-red-600 hover:bg-red-700 text-white py-6 flex-col h-auto"
                                    >
                                        <Youtube className="w-6 h-6 mb-2" />
                                        <span className="font-semibold">YouTube</span>
                                        <span className="text-xs opacity-70">Shorts</span>
                                    </Button>
                                </div>

                                {/* Caption Previews */}
                                <div className="space-y-3 mt-6">
                                    <h3 className="font-semibold text-white text-sm">Caption Previews</h3>
                                    
                                    {['tiktok', 'instagram', 'youtube'].map((platform) => (
                                        <div key={platform} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-white capitalize">{platform}</span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => copyToClipboard(generateSocialMediaCaption(platform))}
                                                    className="text-slate-400 hover:text-white"
                                                >
                                                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                                </Button>
                                            </div>
                                            <Textarea
                                                value={generateSocialMediaCaption(platform)}
                                                readOnly
                                                className="bg-slate-900 border-slate-600 text-slate-300 text-xs h-24 resize-none"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, Wand2, FileText, Lightbulb, TrendingUp, 
    Loader2, Copy, Check, ArrowLeft, Download, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { presets } from '@/components/viral/StylePresets';

export default function ScriptGenerator() {
    const [topic, setTopic] = useState('');
    const [keywords, setKeywords] = useState('');
    const [platform, setPlatform] = useState('tiktok');
    const [stylePreset, setStylePreset] = useState('balanced');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const platforms = [
        { id: 'tiktok', name: 'TikTok', duration: '15-60s', format: '9:16' },
        { id: 'reels', name: 'Instagram Reels', duration: '15-90s', format: '9:16' },
        { id: 'shorts', name: 'YouTube Shorts', duration: '15-60s', format: '9:16' }
    ];

    const getStyleInfo = () => presets.find(p => p.id === stylePreset);

    const generateContent = async () => {
        if (!topic.trim()) {
            toast.error('Please enter a topic');
            return;
        }

        setIsGenerating(true);

        try {
            const styleInfo = getStyleInfo();
            const platformInfo = platforms.find(p => p.id === platform);
            const keywordsArray = keywords.split(',').map(k => k.trim()).filter(k => k);

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: `You are an expert viral content creator and scriptwriter. Generate content for ${platformInfo.name} based on the following:

Topic: ${topic}
${keywordsArray.length > 0 ? `Keywords: ${keywordsArray.join(', ')}` : ''}
Style: ${styleInfo.name} - ${styleInfo.description}
Platform: ${platformInfo.name} (${platformInfo.duration}, ${platformInfo.format} aspect ratio)

Generate:

1. FULL VIDEO SCRIPT:
- Hook (first 3 seconds - must grab attention immediately)
- Main content (engaging body that delivers value)
- Call-to-action (ending that encourages engagement)
- Include specific dialogue/narration
- Note visual elements and on-screen text suggestions
- Keep it within ${platformInfo.duration}

2. VIDEO CONCEPTS (5 unique concepts):
For each concept provide:
- Catchy title
- One-sentence pitch
- Why it would work on ${platformInfo.name}
- Estimated viral potential (0-100)
- Specific hashtags
- Key elements to include

Make everything highly specific, actionable, and optimized for ${platformInfo.name}'s algorithm. Focus on the ${styleInfo.name} style characteristics.`,
                response_json_schema: {
                    type: "object",
                    properties: {
                        script: {
                            type: "object",
                            properties: {
                                hook: { type: "string" },
                                mainContent: { type: "string" },
                                callToAction: { type: "string" },
                                visualSuggestions: { type: "array", items: { type: "string" } },
                                onScreenText: { type: "array", items: { type: "string" } },
                                estimatedDuration: { type: "string" },
                                notes: { type: "string" }
                            }
                        },
                        concepts: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    title: { type: "string" },
                                    pitch: { type: "string" },
                                    whyItWorks: { type: "string" },
                                    viralPotential: { type: "number" },
                                    hashtags: { type: "array", items: { type: "string" } },
                                    keyElements: { type: "array", items: { type: "string" } }
                                }
                            }
                        }
                    }
                }
            });

            setGeneratedContent(result);
            toast.success('Content generated successfully!');
        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Failed to generate content. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const downloadScript = () => {
        if (!generatedContent?.script) return;

        const script = generatedContent.script;
        const content = `VIDEO SCRIPT - ${topic}
Platform: ${platforms.find(p => p.id === platform).name}
Style: ${getStyleInfo().name}
Duration: ${script.estimatedDuration}

=== HOOK (First 3 seconds) ===
${script.hook}

=== MAIN CONTENT ===
${script.mainContent}

=== CALL TO ACTION ===
${script.callToAction}

=== VISUAL SUGGESTIONS ===
${script.visualSuggestions?.join('\n') || 'N/A'}

=== ON-SCREEN TEXT ===
${script.onScreenText?.join('\n') || 'N/A'}

=== NOTES ===
${script.notes || 'N/A'}

Generated by ViralClip AI`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `script-${topic.replace(/\s+/g, '-').toLowerCase()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Script downloaded!');
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Gradient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 px-4 py-12 md:py-20">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-12">
                        <Link to={createPageUrl('Dashboard')}>
                            <Button variant="ghost" className="text-slate-400 hover:text-white mb-4">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>

                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-6">
                                <Wand2 className="w-4 h-4 text-purple-400" />
                                <span className="text-sm font-medium text-purple-300">AI-Powered Script Writer</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                Generate Viral Video
                                <br />
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                    Scripts & Concepts
                                </span>
                            </h1>
                            
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                Enter your topic and let AI create platform-optimized scripts and video concepts
                                tailored to your chosen style.
                            </p>
                        </div>
                    </div>

                    {/* Input Form */}
                    {!generatedContent && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-2xl mx-auto"
                        >
                            <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700 p-6">
                                <div className="space-y-6">
                                    <div>
                                        <Label className="text-white text-base mb-2 block">
                                            What's your video about?
                                        </Label>
                                        <Input
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., Morning productivity routine, Healthy meal prep tips..."
                                            className="bg-slate-900 border-slate-600 text-white text-lg h-12"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white text-base mb-2 block">
                                            Keywords (optional)
                                        </Label>
                                        <Input
                                            value={keywords}
                                            onChange={(e) => setKeywords(e.target.value)}
                                            placeholder="productivity, coffee, morning, routine"
                                            className="bg-slate-900 border-slate-600 text-white"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Separate with commas</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-white text-base mb-2 block">Platform</Label>
                                            <Select value={platform} onValueChange={setPlatform}>
                                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    {platforms.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name} ({p.duration})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label className="text-white text-base mb-2 block">Style Preset</Label>
                                            <Select value={stylePreset} onValueChange={setStylePreset}>
                                                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700">
                                                    {presets.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>
                                                            {p.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={generateContent}
                                        disabled={isGenerating || !topic.trim()}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6 text-lg"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Content...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Script & Concepts
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {/* Generated Content */}
                    <AnimatePresence>
                        {generatedContent && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{topic}</h2>
                                        <p className="text-slate-400">
                                            {platforms.find(p => p.id === platform).name} • {getStyleInfo().name}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setGeneratedContent(null);
                                            setTopic('');
                                            setKeywords('');
                                        }}
                                        variant="outline"
                                        className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        New Script
                                    </Button>
                                </div>

                                <Tabs defaultValue="script" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-6">
                                        <TabsTrigger value="script">
                                            <FileText className="w-4 h-4 mr-2" />
                                            Full Script
                                        </TabsTrigger>
                                        <TabsTrigger value="concepts">
                                            <Lightbulb className="w-4 h-4 mr-2" />
                                            Video Concepts
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Script Tab */}
                                    <TabsContent value="script">
                                        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700 p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                                        Duration: {generatedContent.script.estimatedDuration}
                                                    </Badge>
                                                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                                                        {platforms.find(p => p.id === platform).name}
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => copyToClipboard(
                                                            `${generatedContent.script.hook}\n\n${generatedContent.script.mainContent}\n\n${generatedContent.script.callToAction}`,
                                                            'script'
                                                        )}
                                                        className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                                                    >
                                                        {copiedIndex === 'script' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={downloadScript}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Sparkles className="w-5 h-5 text-amber-400" />
                                                        <h3 className="text-lg font-semibold text-white">Hook (First 3 seconds)</h3>
                                                    </div>
                                                    <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-amber-400">
                                                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                            {generatedContent.script.hook}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <FileText className="w-5 h-5 text-blue-400" />
                                                        <h3 className="text-lg font-semibold text-white">Main Content</h3>
                                                    </div>
                                                    <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-blue-400">
                                                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                            {generatedContent.script.mainContent}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <TrendingUp className="w-5 h-5 text-green-400" />
                                                        <h3 className="text-lg font-semibold text-white">Call to Action</h3>
                                                    </div>
                                                    <div className="bg-slate-900/50 rounded-lg p-4 border-l-4 border-green-400">
                                                        <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                                                            {generatedContent.script.callToAction}
                                                        </p>
                                                    </div>
                                                </div>

                                                {generatedContent.script.visualSuggestions?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-base font-semibold text-white mb-3">Visual Suggestions</h3>
                                                        <div className="bg-slate-900/50 rounded-lg p-4">
                                                            <ul className="space-y-2">
                                                                {generatedContent.script.visualSuggestions.map((suggestion, i) => (
                                                                    <li key={i} className="text-slate-300 flex items-start gap-2">
                                                                        <span className="text-purple-400 mt-1">•</span>
                                                                        <span>{suggestion}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}

                                                {generatedContent.script.onScreenText?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-base font-semibold text-white mb-3">On-Screen Text</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {generatedContent.script.onScreenText.map((text, i) => (
                                                                <span 
                                                                    key={i}
                                                                    className="px-3 py-1 bg-slate-700 text-slate-200 rounded-lg text-sm"
                                                                >
                                                                    {text}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {generatedContent.script.notes && (
                                                    <div>
                                                        <h3 className="text-base font-semibold text-white mb-3">Production Notes</h3>
                                                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
                                                            <p className="text-purple-200 text-sm leading-relaxed">
                                                                {generatedContent.script.notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    {/* Concepts Tab */}
                                    <TabsContent value="concepts">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {generatedContent.concepts.map((concept, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700 p-5 hover:border-purple-500/30 transition-all h-full">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="text-xs font-medium text-slate-500">
                                                                        CONCEPT #{index + 1}
                                                                    </span>
                                                                    <Badge className={
                                                                        concept.viralPotential >= 80 
                                                                            ? "bg-gradient-to-r from-orange-500 to-red-500 border-0"
                                                                            : concept.viralPotential >= 65
                                                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 border-0"
                                                                            : "bg-slate-600 border-0"
                                                                    }>
                                                                        {concept.viralPotential >= 80 ? '🔥 High' : concept.viralPotential >= 65 ? '⚡ Good' : '✨ Solid'}
                                                                    </Badge>
                                                                </div>
                                                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                                                    {concept.title}
                                                                </h3>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => copyToClipboard(
                                                                    `${concept.title}\n\n${concept.pitch}\n\n${concept.whyItWorks}\n\nHashtags: ${concept.hashtags.map(h => `#${h}`).join(' ')}`,
                                                                    index
                                                                )}
                                                                className="text-slate-400 hover:text-white"
                                                            >
                                                                {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                            </Button>
                                                        </div>

                                                        <p className="text-slate-300 mb-3 leading-relaxed">
                                                            {concept.pitch}
                                                        </p>

                                                        <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
                                                            <p className="text-xs font-medium text-amber-400 mb-1">Why It Works</p>
                                                            <p className="text-sm text-slate-300">
                                                                {concept.whyItWorks}
                                                            </p>
                                                        </div>

                                                        {concept.keyElements?.length > 0 && (
                                                            <div className="mb-3">
                                                                <p className="text-xs font-medium text-slate-400 mb-2">Key Elements</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {concept.keyElements.map((element, i) => (
                                                                        <span 
                                                                            key={i}
                                                                            className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded text-xs"
                                                                        >
                                                                            {element}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-2">
                                                            {concept.hashtags.map((tag, i) => (
                                                                <span 
                                                                    key={i}
                                                                    className="text-xs text-purple-300"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
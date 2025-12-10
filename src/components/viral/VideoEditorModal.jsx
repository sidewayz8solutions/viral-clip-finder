import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Wand2, Scissors, Type, Music, Subtitles, Zap, 
    Download, Sparkles, Play, Pause, Volume2, Settings,
    Maximize2, FastForward, Palette, Save, Plus, Sliders
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const styleEffects = {
    fast_paced: {
        transitions: ['Quick Cut', 'Zoom', 'Flash'],
        effects: ['Motion Blur', 'Speed Ramp', 'Dynamic Zoom'],
        music: 'High-energy electronic beats'
    },
    educational: {
        transitions: ['Fade', 'Slide', 'Clean Cut'],
        effects: ['Highlight Box', 'Arrow Annotations', 'Key Points'],
        music: 'Calm background music'
    },
    emotional: {
        transitions: ['Fade', 'Cross Dissolve', 'Soft Blur'],
        effects: ['Cinematic Grade', 'Vignette', 'Slow Motion'],
        music: 'Emotional piano or strings'
    },
    comedy: {
        transitions: ['Jump Cut', 'Bounce', 'Spin'],
        effects: ['Sound Effects', 'Reaction Zoom', 'Comic Text'],
        music: 'Upbeat comedy sounds'
    },
    trending: {
        transitions: ['Viral Transition', 'Swipe', 'Glitch'],
        effects: ['Trending Filter', 'Viral Text', 'Shake Effect'],
        music: 'Trending TikTok sounds'
    },
    balanced: {
        transitions: ['Smooth', 'Fade', 'Cut'],
        effects: ['Standard Grade', 'Subtle Effects'],
        music: 'Versatile background music'
    }
};

export default function VideoEditorModal({ clip, isOpen, onClose, videoUrl, stylePreset = 'balanced' }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState(null);
    const [showPresetSave, setShowPresetSave] = useState(false);
    const [presetName, setPresetName] = useState('');
    const [selectedCustomPreset, setSelectedCustomPreset] = useState(null);
    const queryClient = useQueryClient();
    
    const [editSettings, setEditSettings] = useState({
        aspectRatio: '9:16',
        speed: 1.0,
        addCaptions: true,
        addMusic: true,
        autoEdit: true,
        captionStyle: 'dynamic',
        textOverlay: '',
        transitions: true,
        effects: true,
        musicVolume: 0.3,
        transitionIntensity: 50,
        effectComplexity: 50,
        musicMoodIntensity: 50,
        colorGrading: 'auto',
        captionAnimation: 'slide'
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const currentUser = await base44.auth.me();
                setUser(currentUser);
            } catch (error) {
                console.log('User not logged in');
            }
        };
        if (isOpen) {
            loadUser();
        }
    }, [isOpen]);

    const { data: customPresets = [] } = useQuery({
        queryKey: ['videoEditorPresets', user?.id],
        queryFn: () => base44.entities.VideoEditorPreset.filter({ created_by: user?.email }),
        enabled: !!user && isOpen,
    });

    const savePresetMutation = useMutation({
        mutationFn: (data) => base44.entities.VideoEditorPreset.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['videoEditorPresets']);
            toast.success('Custom preset saved!');
            setShowPresetSave(false);
            setPresetName('');
        },
    });

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleExport = async () => {
        setIsProcessing(true);
        
        // Simulate processing
        toast.info('AI Video Editor requires backend processing', {
            description: 'Enable backend functions to unlock video editing, auto-captions, and music integration.',
            duration: 5000
        });

        setTimeout(() => {
            setIsProcessing(false);
        }, 2000);
    };

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            toast.error('Please enter a preset name');
            return;
        }

        savePresetMutation.mutate({
            preset_name: presetName,
            settings: editSettings,
            style_base: stylePreset
        });
    };

    const handleLoadPreset = (preset) => {
        setEditSettings(preset.settings);
        setSelectedCustomPreset(preset.id);
        toast.success(`Loaded preset: ${preset.preset_name}`);
    };

    const styleInfo = styleEffects[stylePreset] || styleEffects.balanced;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700 p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Wand2 className="w-5 h-5 text-purple-400" />
                                    <h2 className="text-2xl font-bold text-white">AI Video Editor</h2>
                                </div>
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Preview Area */}
                            <div className="lg:col-span-2">
                                <Card className="bg-slate-800 border-slate-700 p-4">
                                    <div className="aspect-[9/16] max-h-[600px] mx-auto bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="w-16 h-16 text-slate-600" />
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Play className="w-4 h-4 text-white" />
                                                    <div className="flex-1 h-1 bg-slate-700 rounded-full">
                                                        <div className="h-full w-1/3 bg-purple-500 rounded-full" />
                                                    </div>
                                                    <span className="text-xs text-white">0:15 / 0:45</span>
                                                </div>
                                                {editSettings.addCaptions && (
                                                    <div className="text-center">
                                                        <p className="text-white font-bold text-lg bg-black/60 px-3 py-1 rounded inline-block">
                                                            {clip.transcript.substring(0, 50)}...
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                                            Preview Mode
                                        </Badge>
                                        <div className="text-sm text-slate-400">
                                            {formatTime(clip.startTime)} - {formatTime(clip.endTime)} ({clip.duration}s)
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Controls */}
                            <div className="space-y-4">
                                {/* Custom Presets */}
                                {customPresets.length > 0 && (
                                    <Card className="bg-slate-800 border-slate-700 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Save className="w-4 h-4 text-green-400" />
                                            <h3 className="font-semibold text-white text-sm">Your Custom Presets</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {customPresets.map((preset) => (
                                                <Button
                                                    key={preset.id}
                                                    size="sm"
                                                    variant={selectedCustomPreset === preset.id ? "default" : "outline"}
                                                    onClick={() => handleLoadPreset(preset)}
                                                    className={selectedCustomPreset === preset.id 
                                                        ? "bg-purple-600 text-white" 
                                                        : "border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                                                    }
                                                >
                                                    {preset.preset_name}
                                                </Button>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                <Tabs defaultValue="ai" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                                        <TabsTrigger value="ai">
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            AI Auto
                                        </TabsTrigger>
                                        <TabsTrigger value="advanced">
                                            <Sliders className="w-4 h-4 mr-2" />
                                            Advanced
                                        </TabsTrigger>
                                        <TabsTrigger value="manual">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Manual
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* AI Auto Tab */}
                                    <TabsContent value="ai" className="space-y-4 mt-4">
                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-4 h-4 text-amber-400" />
                                                <h3 className="font-semibold text-white">AI-Powered Editing</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-white text-sm">Auto-Edit Clips</Label>
                                                        <p className="text-xs text-slate-400">Dynamic cuts & transitions</p>
                                                    </div>
                                                    <Switch
                                                        checked={editSettings.autoEdit}
                                                        onCheckedChange={(checked) => setEditSettings({...editSettings, autoEdit: checked})}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-white text-sm">Add Transitions</Label>
                                                        <p className="text-xs text-slate-400">{styleInfo.transitions.join(', ')}</p>
                                                    </div>
                                                    <Switch
                                                        checked={editSettings.transitions}
                                                        onCheckedChange={(checked) => setEditSettings({...editSettings, transitions: checked})}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <Label className="text-white text-sm">Apply Effects</Label>
                                                        <p className="text-xs text-slate-400">{styleInfo.effects.join(', ')}</p>
                                                    </div>
                                                    <Switch
                                                        checked={editSettings.effects}
                                                        onCheckedChange={(checked) => setEditSettings({...editSettings, effects: checked})}
                                                    />
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Subtitles className="w-4 h-4 text-blue-400" />
                                                <h3 className="font-semibold text-white">AI Captions</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-white text-sm">Auto-Generate Captions</Label>
                                                    <Switch
                                                        checked={editSettings.addCaptions}
                                                        onCheckedChange={(checked) => setEditSettings({...editSettings, addCaptions: checked})}
                                                    />
                                                </div>

                                                {editSettings.addCaptions && (
                                                    <div>
                                                        <Label className="text-white text-sm">Caption Style</Label>
                                                        <Select
                                                            value={editSettings.captionStyle}
                                                            onValueChange={(value) => setEditSettings({...editSettings, captionStyle: value})}
                                                        >
                                                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                                <SelectItem value="dynamic">Dynamic (Word-by-word)</SelectItem>
                                                                <SelectItem value="classic">Classic Subtitles</SelectItem>
                                                                <SelectItem value="trendy">Trendy TikTok Style</SelectItem>
                                                                <SelectItem value="minimal">Minimal</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Music className="w-4 h-4 text-pink-400" />
                                                <h3 className="font-semibold text-white">Background Music</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-white text-sm">Add Music</Label>
                                                    <Switch
                                                        checked={editSettings.addMusic}
                                                        onCheckedChange={(checked) => setEditSettings({...editSettings, addMusic: checked})}
                                                    />
                                                </div>

                                                {editSettings.addMusic && (
                                                    <>
                                                        <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded">
                                                            <Music className="w-3 h-3 inline mr-1" />
                                                            {styleInfo.music}
                                                        </div>
                                                        <div>
                                                            <Label className="text-white text-sm">Music Volume</Label>
                                                            <Slider
                                                                value={[editSettings.musicVolume * 100]}
                                                                onValueChange={([value]) => setEditSettings({...editSettings, musicVolume: value / 100})}
                                                                max={100}
                                                                step={1}
                                                                className="mt-2"
                                                            />
                                                            <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                                <span>Subtle</span>
                                                                <span>{Math.round(editSettings.musicVolume * 100)}%</span>
                                                                <span>Loud</span>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </Card>
                                    </TabsContent>

                                    {/* Advanced Tab */}
                                    <TabsContent value="advanced" className="space-y-4 mt-4">
                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-4 h-4 text-purple-400" />
                                                <h3 className="font-semibold text-white">Fine-Tune Parameters</h3>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-white text-sm">Transition Intensity</Label>
                                                        <span className="text-xs text-slate-400">{editSettings.transitionIntensity}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[editSettings.transitionIntensity]}
                                                        onValueChange={([value]) => setEditSettings({...editSettings, transitionIntensity: value})}
                                                        max={100}
                                                        step={1}
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                        <span>Subtle</span>
                                                        <span>Moderate</span>
                                                        <span>Dramatic</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-white text-sm">Effect Complexity</Label>
                                                        <span className="text-xs text-slate-400">{editSettings.effectComplexity}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[editSettings.effectComplexity]}
                                                        onValueChange={([value]) => setEditSettings({...editSettings, effectComplexity: value})}
                                                        max={100}
                                                        step={1}
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                        <span>Minimal</span>
                                                        <span>Balanced</span>
                                                        <span>Heavy</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Label className="text-white text-sm">Music Mood Intensity</Label>
                                                        <span className="text-xs text-slate-400">{editSettings.musicMoodIntensity}%</span>
                                                    </div>
                                                    <Slider
                                                        value={[editSettings.musicMoodIntensity]}
                                                        onValueChange={([value]) => setEditSettings({...editSettings, musicMoodIntensity: value})}
                                                        max={100}
                                                        step={1}
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                        <span>Calm</span>
                                                        <span>Energetic</span>
                                                        <span>Epic</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Subtitles className="w-4 h-4 text-cyan-400" />
                                                <h3 className="font-semibold text-white">Caption Customization</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-white text-sm">Animation Style</Label>
                                                    <Select
                                                        value={editSettings.captionAnimation}
                                                        onValueChange={(value) => setEditSettings({...editSettings, captionAnimation: value})}
                                                    >
                                                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="slide">Slide In</SelectItem>
                                                            <SelectItem value="fade">Fade In</SelectItem>
                                                            <SelectItem value="bounce">Bounce</SelectItem>
                                                            <SelectItem value="zoom">Zoom</SelectItem>
                                                            <SelectItem value="typewriter">Typewriter</SelectItem>
                                                            <SelectItem value="none">No Animation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white text-sm">Caption Position</Label>
                                                    <Select defaultValue="center">
                                                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="top">Top</SelectItem>
                                                            <SelectItem value="center">Center</SelectItem>
                                                            <SelectItem value="bottom">Bottom</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Palette className="w-4 h-4 text-orange-400" />
                                                <h3 className="font-semibold text-white">Advanced Color Grading</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <Select 
                                                    value={editSettings.colorGrading}
                                                    onValueChange={(value) => setEditSettings({...editSettings, colorGrading: value})}
                                                >
                                                    <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700">
                                                        <SelectItem value="auto">Auto (AI-Selected)</SelectItem>
                                                        <SelectItem value="vibrant">Vibrant & Saturated</SelectItem>
                                                        <SelectItem value="cinematic">Cinematic Film Look</SelectItem>
                                                        <SelectItem value="vintage">Vintage Warm</SelectItem>
                                                        <SelectItem value="bw">Black & White</SelectItem>
                                                        <SelectItem value="moody">Moody Dark</SelectItem>
                                                        <SelectItem value="bright">Bright & Airy</SelectItem>
                                                        <SelectItem value="neon">Neon Pop</SelectItem>
                                                    </SelectContent>
                                                </Select>

                                                <div>
                                                    <Label className="text-white text-sm">Contrast</Label>
                                                    <Slider
                                                        defaultValue={[50]}
                                                        max={100}
                                                        step={1}
                                                        className="mt-2"
                                                    />
                                                </div>

                                                <div>
                                                    <Label className="text-white text-sm">Saturation</Label>
                                                    <Slider
                                                        defaultValue={[50]}
                                                        max={100}
                                                        step={1}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </Card>

                                        {/* Save Custom Preset */}
                                        <Card className="bg-purple-500/10 border-purple-500/30 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Save className="w-4 h-4 text-purple-400" />
                                                <h3 className="font-semibold text-white text-sm">Save Custom Preset</h3>
                                            </div>
                                            
                                            {!showPresetSave ? (
                                                <Button
                                                    onClick={() => setShowPresetSave(true)}
                                                    variant="outline"
                                                    className="w-full border-purple-500/50 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300"
                                                >
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Save Current Settings as Preset
                                                </Button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Input
                                                        value={presetName}
                                                        onChange={(e) => setPresetName(e.target.value)}
                                                        placeholder="e.g., My Fast-Paced Style"
                                                        className="bg-slate-900 border-slate-600 text-white"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            onClick={handleSavePreset}
                                                            disabled={!presetName.trim()}
                                                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                                        >
                                                            Save Preset
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setShowPresetSave(false);
                                                                setPresetName('');
                                                            }}
                                                            variant="outline"
                                                            className="border-slate-600 bg-slate-700 hover:bg-slate-600 text-white"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </TabsContent>

                                    {/* Manual Tab */}
                                    <TabsContent value="manual" className="space-y-4 mt-4">
                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Maximize2 className="w-4 h-4 text-green-400" />
                                                <h3 className="font-semibold text-white">Video Format</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-white text-sm">Aspect Ratio</Label>
                                                    <Select
                                                        value={editSettings.aspectRatio}
                                                        onValueChange={(value) => setEditSettings({...editSettings, aspectRatio: value})}
                                                    >
                                                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="9:16">9:16 (TikTok/Reels)</SelectItem>
                                                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                                                            <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                                                            <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white text-sm">Playback Speed</Label>
                                                    <Slider
                                                        value={[editSettings.speed * 100]}
                                                        onValueChange={([value]) => setEditSettings({...editSettings, speed: value / 100})}
                                                        min={50}
                                                        max={200}
                                                        step={10}
                                                        className="mt-2"
                                                    />
                                                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                                                        <span>0.5x</span>
                                                        <span>{editSettings.speed.toFixed(1)}x</span>
                                                        <span>2.0x</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Type className="w-4 h-4 text-cyan-400" />
                                                <h3 className="font-semibold text-white">Text Overlay</h3>
                                            </div>
                                            
                                            <Textarea
                                                value={editSettings.textOverlay}
                                                onChange={(e) => setEditSettings({...editSettings, textOverlay: e.target.value})}
                                                placeholder="Add custom text overlay..."
                                                className="bg-slate-900 border-slate-600 text-white h-20"
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Text will appear at the top of the video
                                            </p>
                                        </Card>

                                        <Card className="bg-slate-800 border-slate-700 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Music className="w-4 h-4 text-pink-400" />
                                                <h3 className="font-semibold text-white">Audio Settings</h3>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div>
                                                    <Label className="text-white text-sm">Background Music</Label>
                                                    <Select defaultValue="auto">
                                                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="auto">Auto-Select</SelectItem>
                                                            <SelectItem value="upbeat">Upbeat</SelectItem>
                                                            <SelectItem value="chill">Chill</SelectItem>
                                                            <SelectItem value="epic">Epic</SelectItem>
                                                            <SelectItem value="corporate">Corporate</SelectItem>
                                                            <SelectItem value="none">No Music</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label className="text-white text-sm">Voice Enhancement</Label>
                                                    <Select defaultValue="auto">
                                                        <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700">
                                                            <SelectItem value="auto">Auto</SelectItem>
                                                            <SelectItem value="clear">Clear Voice</SelectItem>
                                                            <SelectItem value="warm">Warm & Rich</SelectItem>
                                                            <SelectItem value="radio">Radio Quality</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>

                        {/* Backend Notice */}
                        <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                            <div className="flex gap-3">
                                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="text-amber-200 font-medium mb-1">Backend Processing Required</p>
                                    <p className="text-amber-300/80">
                                        This AI Video Editor requires backend functions for video processing, auto-captions, 
                                        music integration, and rendering. Enable backend functions in your app settings to unlock 
                                        professional video editing capabilities.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 mt-6">
                            <Button
                                onClick={handleExport}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-6"
                            >
                                {isProcessing ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Wand2 className="w-5 h-5 mr-2" />
                                        </motion.div>
                                        Processing Video...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 mr-2" />
                                        Export Edited Video
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
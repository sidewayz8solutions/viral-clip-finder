import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { User, Settings, Heart, History, Sparkles, Plus, Save, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Profile() {
    const [user, setUser] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const loadUser = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
        };
        loadUser();
    }, []);

    const { data: preferences = [] } = useQuery({
        queryKey: ['preferences', user?.id],
        queryFn: () => base44.entities.UserPreference.filter({ created_by: user?.email }),
        enabled: !!user,
    });

    const { data: history = [] } = useQuery({
        queryKey: ['history', user?.id],
        queryFn: () => base44.entities.AnalysisHistory.list('-created_date', 20),
        enabled: !!user,
    });

    const { data: savedClips = [] } = useQuery({
        queryKey: ['savedClips', user?.id],
        queryFn: () => base44.entities.SavedClip.list('-created_date', 50),
        enabled: !!user,
    });

    const { data: customPresets = [] } = useQuery({
        queryKey: ['customPresets', user?.id],
        queryFn: () => base44.entities.CustomStylePreset.list('-created_date'),
        enabled: !!user,
    });

    const userPreference = preferences[0];

    const savePreferencesMutation = useMutation({
        mutationFn: (data) => {
            if (userPreference?.id) {
                return base44.entities.UserPreference.update(userPreference.id, data);
            }
            return base44.entities.UserPreference.create(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['preferences']);
            toast.success('Preferences saved!');
        },
    });

    const deleteHistoryMutation = useMutation({
        mutationFn: (id) => base44.entities.AnalysisHistory.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['history']);
            toast.success('History item deleted');
        },
    });

    const deleteSavedClipMutation = useMutation({
        mutationFn: (id) => base44.entities.SavedClip.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['savedClips']);
            toast.success('Clip removed from favorites');
        },
    });

    const [newPreset, setNewPreset] = useState({
        preset_name: '',
        description: '',
        focus_instructions: '',
        title_style: '',
        preferred_hashtags: [],
        icon_name: 'Sparkles',
        color_scheme: 'purple'
    });

    const createPresetMutation = useMutation({
        mutationFn: (data) => base44.entities.CustomStylePreset.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['customPresets']);
            toast.success('Custom preset created!');
            setNewPreset({
                preset_name: '',
                description: '',
                focus_instructions: '',
                title_style: '',
                preferred_hashtags: [],
                icon_name: 'Sparkles',
                color_scheme: 'purple'
            });
        },
    });

    const handleSavePreferences = (updates) => {
        const data = { ...userPreference, ...updates };
        savePreferencesMutation.mutate(data);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 px-4 py-12 max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link to={createPageUrl('Dashboard')}>
                        <Button variant="ghost" className="text-slate-400 hover:text-white mb-4">
                            ← Back to Dashboard
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">Profile & Settings</h1>
                    <p className="text-slate-400">Manage your preferences, history, and saved clips</p>
                </div>

                <Tabs defaultValue="settings" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-800 mb-6">
                        <TabsTrigger value="settings">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <History className="w-4 h-4 mr-2" />
                            History
                        </TabsTrigger>
                        <TabsTrigger value="favorites">
                            <Heart className="w-4 h-4 mr-2" />
                            Favorites
                        </TabsTrigger>
                        <TabsTrigger value="custom">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Custom Styles
                        </TabsTrigger>
                    </TabsList>

                    {/* Settings Tab */}
                    <TabsContent value="settings">
                        <div className="grid gap-6">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Social Media Accounts</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Connect your accounts for easier sharing
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-white">TikTok Username</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="@yourusername"
                                                value={userPreference?.tiktok_username || ''}
                                                onChange={(e) => setUser({ ...user, tiktok: e.target.value })}
                                                className="bg-slate-900 border-slate-600 text-white"
                                            />
                                            <Button
                                                onClick={() => handleSavePreferences({ tiktok_username: user.tiktok })}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-white">Instagram Username</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="@yourusername"
                                                value={userPreference?.instagram_username || ''}
                                                onChange={(e) => setUser({ ...user, instagram: e.target.value })}
                                                className="bg-slate-900 border-slate-600 text-white"
                                            />
                                            <Button
                                                onClick={() => handleSavePreferences({ instagram_username: user.instagram })}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-white">YouTube Channel</Label>
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                placeholder="Your channel name"
                                                value={userPreference?.youtube_channel || ''}
                                                onChange={(e) => setUser({ ...user, youtube: e.target.value })}
                                                className="bg-slate-900 border-slate-600 text-white"
                                            />
                                            <Button
                                                onClick={() => handleSavePreferences({ youtube_channel: user.youtube })}
                                                className="bg-purple-600 hover:bg-purple-700"
                                            >
                                                <Save className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Analysis Preferences</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-white">Default Style Preset</Label>
                                        <Select
                                            value={userPreference?.default_style_preset || 'balanced'}
                                            onValueChange={(value) => handleSavePreferences({ default_style_preset: value })}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-800 border-slate-700">
                                                <SelectItem value="fast_paced">Fast-Paced Action</SelectItem>
                                                <SelectItem value="educational">Educational Explainer</SelectItem>
                                                <SelectItem value="emotional">Emotional Storytelling</SelectItem>
                                                <SelectItem value="comedy">Comedy Skit</SelectItem>
                                                <SelectItem value="trending">Trend-Focused</SelectItem>
                                                <SelectItem value="balanced">Balanced Mix</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label className="text-white">Auto-save Analyses</Label>
                                            <p className="text-sm text-slate-400">Automatically save all video analyses</p>
                                        </div>
                                        <Switch
                                            checked={userPreference?.auto_save_analyses ?? true}
                                            onCheckedChange={(checked) => handleSavePreferences({ auto_save_analyses: checked })}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Analysis History</CardTitle>
                                <CardDescription className="text-slate-400">
                                    View your past video analyses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {history.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No analysis history yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {history.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-semibold mb-1">{item.video_title}</h3>
                                                        <div className="flex items-center gap-3 text-sm text-slate-400">
                                                            <Badge variant="outline" className="border-slate-600">
                                                                {item.style_preset}
                                                            </Badge>
                                                            <span>{item.clips_found} clips found</span>
                                                            <span>{format(new Date(item.created_date), 'MMM d, yyyy')}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteHistoryMutation.mutate(item.id)}
                                                        className="text-slate-400 hover:text-red-400"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Favorites Tab */}
                    <TabsContent value="favorites">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white">Saved Clips</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Your favorite clips from all analyses
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {savedClips.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No saved clips yet</p>
                                        <p className="text-sm text-slate-500 mt-2">Click the heart icon on clips to save them</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {savedClips.map((clip) => (
                                            <div
                                                key={clip.id}
                                                className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 hover:border-purple-500/30 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-white font-semibold mb-1">{clip.clip_title}</h3>
                                                        <p className="text-sm text-slate-400 mb-2">{clip.video_title}</p>
                                                        {clip.tags?.length > 0 && (
                                                            <div className="flex gap-2 flex-wrap">
                                                                {clip.tags.map((tag, i) => (
                                                                    <Badge key={i} variant="secondary" className="text-xs">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteSavedClipMutation.mutate(clip.id)}
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        <Heart className="w-4 h-4 fill-current" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Custom Styles Tab */}
                    <TabsContent value="custom">
                        <div className="grid gap-6">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Create Custom Style Preset</CardTitle>
                                    <CardDescription className="text-slate-400">
                                        Design your own AI analysis style
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-white">Preset Name</Label>
                                        <Input
                                            value={newPreset.preset_name}
                                            onChange={(e) => setNewPreset({ ...newPreset, preset_name: e.target.value })}
                                            placeholder="e.g., Tech Reviews"
                                            className="bg-slate-900 border-slate-600 text-white mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white">Description</Label>
                                        <Input
                                            value={newPreset.description}
                                            onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
                                            placeholder="Brief description of this style"
                                            className="bg-slate-900 border-slate-600 text-white mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white">Focus Instructions</Label>
                                        <Textarea
                                            value={newPreset.focus_instructions}
                                            onChange={(e) => setNewPreset({ ...newPreset, focus_instructions: e.target.value })}
                                            placeholder="Tell the AI what to focus on when finding clips..."
                                            className="bg-slate-900 border-slate-600 text-white mt-2 h-24"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-white">Title Style</Label>
                                        <Input
                                            value={newPreset.title_style}
                                            onChange={(e) => setNewPreset({ ...newPreset, title_style: e.target.value })}
                                            placeholder="How should titles be formatted?"
                                            className="bg-slate-900 border-slate-600 text-white mt-2"
                                        />
                                    </div>

                                    <Button
                                        onClick={() => createPresetMutation.mutate(newPreset)}
                                        disabled={!newPreset.preset_name || !newPreset.focus_instructions}
                                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Custom Preset
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Your Custom Presets</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customPresets.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Sparkles className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                            <p className="text-slate-400">No custom presets yet</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {customPresets.map((preset) => (
                                                <div
                                                    key={preset.id}
                                                    className="bg-slate-900/50 rounded-lg p-4 border border-slate-700"
                                                >
                                                    <h3 className="text-white font-semibold mb-1">{preset.preset_name}</h3>
                                                    <p className="text-sm text-slate-400">{preset.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
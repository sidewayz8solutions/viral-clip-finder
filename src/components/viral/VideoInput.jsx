import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Youtube, Sparkles, Loader2, Link2, Upload, Video, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { presets } from './StylePresets';

export default function VideoInput({ onAnalyze, isLoading, selectedStyle }) {
    const [activeTab, setActiveTab] = useState('url');
    const [url, setUrl] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const getStyleInfo = () => presets.find(p => p.id === selectedStyle);

    const isValidYoutubeUrl = (url) => {
        const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)[\w-]+/;
        return regex.test(url);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'url' && isValidYoutubeUrl(url)) {
            onAnalyze({ type: 'url', data: url });
        } else if (activeTab === 'file' && selectedFile) {
            onAnalyze({ type: 'file', data: selectedFile });
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            setSelectedFile(file);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isSubmitDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'url') return !isValidYoutubeUrl(url);
        if (activeTab === 'file') return !selectedFile;
        return true;
    };

    const styleInfo = getStyleInfo();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-3xl mx-auto"
        >
            {/* Style Badge */}
            {styleInfo && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-4"
                >
                    <Badge className={`${styleInfo.bgColor} ${styleInfo.borderColor} border px-4 py-2`}>
                        {React.createElement(styleInfo.icon, { className: `w-4 h-4 mr-2 inline ${styleInfo.iconColor}` })}
                        <span className={styleInfo.iconColor}>Style: {styleInfo.name}</span>
                    </Badge>
                </motion.div>
            )}

            {/* Tab Selector */}
            <div className="flex justify-center mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-2 bg-slate-800/80 border border-slate-700/50">
                        <TabsTrigger 
                            value="url" 
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                        >
                            <Youtube className="w-4 h-4 mr-2" />
                            YouTube URL
                        </TabsTrigger>
                        <TabsTrigger 
                            value="file"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Video
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <div 
                    className={`absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl transition-opacity duration-300 ${(isFocused || selectedFile) ? 'opacity-100' : 'opacity-0'}`}
                />
                
                <AnimatePresence mode="wait">
                    {activeTab === 'url' ? (
                        <motion.div
                            key="url"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`relative flex items-center bg-slate-800/90 backdrop-blur-xl border rounded-2xl p-2 transition-all duration-300 ${isFocused ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-700/50'}`}
                        >
                            <div className="flex items-center gap-3 pl-4">
                                <Youtube className="w-6 h-6 text-red-500" />
                                <div className="w-px h-8 bg-slate-700" />
                            </div>
                            
                            <Input
                                type="text"
                                placeholder="Paste your YouTube video URL here..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className="flex-1 bg-transparent border-0 text-white placeholder:text-slate-500 text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            
                            <Button
                                type="submit"
                                disabled={isSubmitDisabled()}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Find Clips
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="file"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className={`relative bg-slate-800/90 backdrop-blur-xl border rounded-2xl p-2 transition-all duration-300 ${selectedFile ? 'border-purple-500/50 shadow-lg shadow-purple-500/10' : 'border-slate-700/50'}`}
                        >
                            {!selectedFile ? (
                                <label className="flex flex-col items-center justify-center cursor-pointer py-12 px-6">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={isLoading}
                                    />
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-4">
                                        <Video className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        Drop your video here
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-4">
                                        or click to browse
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Supports MP4, MOV, AVI, WebM (Max 500MB)
                                    </p>
                                </label>
                            ) : (
                                <div className="flex items-center gap-4 p-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                                        <Video className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearFile}
                                        disabled={isLoading}
                                        className="text-slate-400 hover:text-white flex-shrink-0"
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitDisabled()}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex-shrink-0"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Analyze Video
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
                {activeTab === 'url' ? (
                    <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        <span>Supports YouTube, Shorts & Live</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        <span>AI analyzes your video to find viral moments</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
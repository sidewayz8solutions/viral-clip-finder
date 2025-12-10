import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Instagram, Youtube, Link2, Copy, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function QuickShareMenu({ clip, onOpenExport }) {
    const [copied, setCopied] = useState(false);

    const generateQuickCaption = () => {
        const hashtags = clip.suggestedHashtags.map(tag => `#${tag}`).join(' ');
        return `${clip.title}\n\n${clip.transcript.substring(0, 100)}...\n\n${hashtags}`;
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const quickShare = (platform) => {
        const caption = generateQuickCaption();
        copyToClipboard(caption);

        const urls = {
            tiktok: 'https://www.tiktok.com/upload',
            instagram: 'https://www.instagram.com/',
            youtube: 'https://studio.youtube.com/'
        };

        setTimeout(() => {
            window.open(urls[platform], '_blank');
        }, 500);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 bg-slate-700/50 hover:bg-slate-700 text-white"
                >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700">
                <DropdownMenuItem
                    onClick={() => onOpenExport()}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                >
                    <Link2 className="w-4 h-4 mr-2" />
                    Export Options
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuItem
                    onClick={() => quickShare('tiktok')}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Share to TikTok
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => quickShare('instagram')}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                >
                    <Instagram className="w-4 h-4 mr-2" />
                    Share to Instagram
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => quickShare('youtube')}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                >
                    <Youtube className="w-4 h-4 mr-2" />
                    Share to YouTube
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-700" />

                <DropdownMenuItem
                    onClick={() => copyToClipboard(generateQuickCaption())}
                    className="text-white hover:bg-slate-700 cursor-pointer"
                >
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Caption
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
'use client';

import { useState } from 'react';
import { Share2, Facebook, Instagram, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/utils/toast';

export interface ShareButtonsProps {
  productUrl: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
}

export function ShareButtons({
  productUrl,
  productTitle,
  productImage,
  productPrice,
}: ShareButtonsProps) {
  const [isNativeShareAvailable] = useState(() => 
    typeof navigator !== 'undefined' && 'share' in navigator
  );

  // Generate share URLs for each platform
  const generateShareUrl = (platform: 'facebook' | 'instagram' | 'whatsapp'): string => {
    const encodedUrl = encodeURIComponent(productUrl);
    const shareText = encodeURIComponent(`${productTitle} - ₹${productPrice}`);

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing, opens Instagram
      whatsapp: `https://wa.me/?text=${shareText}%20${encodedUrl}`,
    };

    return shareUrls[platform];
  };

  // Handle platform-specific sharing
  const handleShare = (platform: 'facebook' | 'instagram' | 'whatsapp') => {
    if (platform === 'instagram') {
      // Instagram doesn't support direct URL sharing, so we'll copy the link and open Instagram
      handleCopyLink();
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
      showSuccessToast('Link copied! Paste it in your Instagram post or story');
      return;
    }
    
    const shareUrl = generateShareUrl(platform);
    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
  };

  // Handle native share (mobile) or copy link (desktop fallback)
  const handleUniversalShare = async () => {
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          text: `${productTitle} - ₹${productPrice}`,
          url: productUrl,
        });
        return;
      } catch (error) {
        // User cancelled or error occurred
        if (error instanceof Error && error.name !== 'AbortError') {
          // Fall through to copy link
        } else {
          return; // User cancelled, don't show error
        }
      }
    }
    
    // Fallback: copy link to clipboard (desktop)
    await handleCopyLink();
  };

  // Handle copy link to clipboard
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(productUrl);
        showSuccessToast('Link copied to clipboard!');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = productUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
          showSuccessToast('Link copied to clipboard!');
        } catch {
          showErrorToast('Failed to copy link');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch {
      showErrorToast('Failed to copy link');
    }
  };

  // If native share is available on mobile, show simplified mobile view
  if (isNativeShareAvailable) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-medium text-neutral-400">Share this product</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleUniversalShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors min-h-[44px] touch-manipulation font-semibold shadow-lg shadow-yellow-500/30"
            aria-label="Share product"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-colors min-h-[44px] touch-manipulation"
            aria-label="Copy link"
          >
            <LinkIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Copy Link</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop/fallback: show all platform buttons
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-neutral-400">Share this product</h3>
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors min-h-[44px] touch-manipulation"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
          <span className="text-sm font-medium">Facebook</span>
        </button>
        
        <button
          onClick={() => handleShare('instagram')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white rounded-lg hover:opacity-90 transition-opacity min-h-[44px] touch-manipulation"
          aria-label="Share on Instagram"
        >
          <Instagram className="w-5 h-5" />
          <span className="text-sm font-medium">Instagram</span>
        </button>
        
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#22C55E] transition-colors min-h-[44px] touch-manipulation"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">WhatsApp</span>
        </button>
        
        <button
          onClick={handleUniversalShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg hover:from-yellow-400 hover:to-yellow-500 transition-colors min-h-[44px] touch-manipulation font-semibold shadow-lg shadow-yellow-500/30"
          aria-label="Share via system share menu or copy link"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
        
        <button
          onClick={handleCopyLink}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-900 transition-colors min-h-[44px] touch-manipulation col-span-2 sm:col-span-1"
          aria-label="Copy link"
        >
          <LinkIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Copy Link</span>
        </button>
      </div>
    </div>
  );
}


import React, { useState, useRef, useMemo } from 'react';
import { Play, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Review } from '../types';

interface ReviewCardProps {
  review: Review;
  onPlay: (review: Review) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onPlay }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div 
      onClick={() => onPlay(review)}
      className="relative aspect-[9/16] w-full rounded-lg overflow-hidden bg-app-card shadow-sm border border-app-card/30 cursor-pointer group active:scale-[0.98] transition-all"
    >
      {/* Thumbnail Image with Error Handling */}
      {review.thumbnailUrl && !imgError ? (
        <img 
          src={review.thumbnailUrl} 
          alt="" 
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-b from-app-card to-app-gold/20 flex items-center justify-center">
          {/* Subtle placeholder for hair style */}
          <div className="w-16 h-16 rounded-full bg-white/20 blur-2xl animate-pulse"></div>
        </div>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

      {/* Centered Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
      </div>

      {/* Bottom Label (Overlay text is okay as it is not a "fallback" for the image) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
        <p className="text-white text-[10px] font-bold text-right opacity-90">
          {review.customerName || 'مراجعة عميلة'}
        </p>
      </div>
    </div>
  );
};

const ReviewsTab: React.FC = () => {
  const { reviews } = useData();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  
  // Reference to the video element to control playback programmatically
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter and sort reviews
  const displayReviews = useMemo(() => {
    return reviews
      .filter(r => r.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [reviews]);

  const handlePlayReview = (review: Review) => {
    setActiveReview(review);
    setIsVideoOpen(true);
  };

  const handleCloseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsVideoOpen(false);
    setActiveReview(null);
  };

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-28 overflow-y-auto no-scrollbar animate-fadeIn relative">
      {/* Centered App Bar Title */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-app-text">مراجعات العملاء</h1>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4">
        {displayReviews.length > 0 ? (
          displayReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onPlay={handlePlayReview} 
            />
          ))
        ) : (
          <div className="col-span-2 text-center text-app-textSec py-10">
            لا توجد مراجعات حالياً.
          </div>
        )}
      </div>

      {/* Bottom Padding for TabBar visibility */}
      <div className="h-4" />

      {/* Full Screen Video Overlay */}
      {isVideoOpen && activeReview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-scaleIn"
          onClick={handleCloseVideo}
        >
          {/* Close Button */}
          <button 
            onClick={handleCloseVideo}
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-50 backdrop-blur-md"
          >
            <X size={24} />
          </button>

          {/* Video Container - Responsive wrapper for MP4 */}
          <div 
            className="w-full max-w-sm md:max-w-2xl bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10"
            onClick={(e) => e.stopPropagation()} 
          >
            <video
              ref={videoRef}
              src={activeReview.videoUrl}
              className="w-full h-auto max-h-[80vh] object-contain bg-black no-controls"
              autoPlay
              playsInline
              muted
              loop
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
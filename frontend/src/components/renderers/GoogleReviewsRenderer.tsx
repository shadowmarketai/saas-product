import { useState } from 'react';

interface GoogleReviewsData {
  business_name?: string;
  logo_url?: string;
  banner_url?: string;
  google_review_url?: string;
  min_stars_for_google?: number;
  tagline?: string;
  rating_average?: number;
  rating_count?: number;
  sample_reviews?: { name: string; rating: number; text: string; date: string }[];
  thank_you_message?: string;
  feedback_prompt?: string;
  theme_primary?: string;
  theme_secondary?: string;
  theme_bg?: string;
  theme_text?: string;
  font_family?: string;
}

interface GoogleReviewsRendererProps {
  data: GoogleReviewsData;
  preview?: boolean;
}

function StarRating({ rating, size = 'text-2xl', interactive = false, onSelect }: { rating: number; size?: string; interactive?: boolean; onSelect?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} transition-transform ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
          style={{ color: star <= (hover || rating) ? '#FBBF24' : '#D1D5DB', filter: star <= (hover || rating) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.4))' : 'none' }}
          onClick={() => interactive && onSelect?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function GoogleReviewsRenderer({ data, preview = false }: GoogleReviewsRendererProps) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const primary = data.theme_primary || '#4285F4';
  const secondary = data.theme_secondary || '#34A853';
  const bg = data.theme_bg || '#FFFFFF';
  const text = data.theme_text || '#1F2937';
  const font = data.font_family || 'Inter, sans-serif';
  const minStars = data.min_stars_for_google || 4;
  const reviews = data.sample_reviews || [];

  if (submitted) {
    return (
      <div className={`${preview ? 'max-w-sm' : 'max-w-md'} mx-auto min-h-screen flex items-center justify-center p-8`} style={{ backgroundColor: bg, fontFamily: font, color: text }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">{data.thank_you_message || 'Thank you!'}</h2>
          <p className="text-gray-500">Your feedback means the world to us.</p>
          <button onClick={() => { setSubmitted(false); setSelectedRating(0); setFeedback(''); }} className="mt-6 px-6 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: primary }}>
            Rate Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${preview ? 'max-w-sm' : 'max-w-md'} mx-auto min-h-screen`} style={{ backgroundColor: bg, fontFamily: font, color: text }}>
      {/* Header */}
      <div className="relative" style={{ background: data.banner_url ? `url(${data.banner_url}) center/cover` : `linear-gradient(135deg, ${primary}, ${secondary})` }}>
        {data.banner_url && <div className="absolute inset-0 bg-black/30" />}
        <div className="relative px-6 py-10 text-center text-white">
          {data.logo_url && <img src={data.logo_url} alt="" className="h-16 mx-auto mb-4 object-contain rounded-xl shadow-lg" />}
          <h1 className="text-2xl font-bold">{data.business_name || 'Business Name'}</h1>
          {data.tagline && <p className="text-sm mt-1 opacity-90">{data.tagline}</p>}
        </div>
      </div>

      {/* Rating Summary */}
      {(data.rating_average || data.rating_count) && (
        <div className="mx-6 -mt-6 relative bg-white rounded-2xl shadow-lg p-5 text-center border border-gray-100">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-bold" style={{ color: primary }}>{data.rating_average?.toFixed(1) || '0'}</span>
            <div>
              <StarRating rating={Math.round(data.rating_average || 0)} size="text-xl" />
              <p className="text-xs text-gray-400 mt-0.5">{data.rating_count || 0} reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Us Section */}
      <div className="px-6 mt-8 text-center">
        <h2 className="text-lg font-bold mb-1">{data.feedback_prompt || 'How was your experience?'}</h2>
        <p className="text-sm text-gray-400 mb-5">Tap a star to rate us</p>
        <div className="flex justify-center">
          <StarRating rating={selectedRating} size="text-4xl" interactive onSelect={setSelectedRating} />
        </div>
      </div>

      {/* Conditional: Google or Private Feedback */}
      {selectedRating > 0 && (
        <div className="px-6 mt-6">
          {selectedRating >= minStars ? (
            <div className="bg-green-50 rounded-2xl p-6 text-center border border-green-100">
              <p className="text-3xl mb-3">🌟</p>
              <h3 className="font-bold text-green-800 mb-2">Awesome! We're glad you loved it!</h3>
              <p className="text-sm text-green-600 mb-4">Would you share your experience on Google? It helps us a lot!</p>
              <a
                href={data.google_review_url || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: primary }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Review on Google
              </a>
              <div className="mt-4">
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-green-200 text-sm resize-none bg-white"
                  rows={3}
                  placeholder="Want to share more? (optional)"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
              <p className="text-3xl text-center mb-3">💭</p>
              <h3 className="font-bold text-orange-800 text-center mb-2">We're sorry to hear that</h3>
              <p className="text-sm text-orange-600 text-center mb-4">Please share your feedback so we can improve</p>
              <div className="space-y-3">
                <input className="w-full px-4 py-2.5 rounded-xl border border-orange-200 text-sm bg-white" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                <textarea className="w-full px-4 py-3 rounded-xl border border-orange-200 text-sm resize-none bg-white" rows={4} placeholder="Tell us what we could do better..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                <button onClick={() => setSubmitted(true)} className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-transform hover:scale-[1.02]" style={{ backgroundColor: '#F97316' }}>
                  Submit Feedback
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sample Reviews */}
      {reviews.length > 0 && (
        <div className="px-6 mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: primary }}>Recent Reviews</h3>
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primary }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{review.name}</p>
                      <p className="text-[10px] text-gray-400">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size="text-sm" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center py-6 text-xs opacity-30 mt-4">
        Powered by NexaStack
      </div>
    </div>
  );
}

export type { GoogleReviewsData };

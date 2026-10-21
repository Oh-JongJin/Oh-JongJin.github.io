import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export const PhotoApp: React.FC = () => {
  const photos = [
    {
      id: 1,
      title: 'Big Sur Coast',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 2,
      title: 'Yosemite Valley',
      url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 3,
      title: 'Sierra Mountains',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 4,
      title: 'Lake Tahoe Sunset',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const [selectedPhoto, setSelectedPhoto] = useState(photos[0]);

  return (
    <div className="flex flex-col-reverse sm:flex-row h-full">
      {/* 사진 썸네일 바 (모바일에서는 하단 가로 스크롤, 데스크톱은 좌측 사이드바) */}
      <div className="w-full sm:w-48 border-t sm:border-t-0 sm:border-r border-white/10 p-2 sm:p-3 overflow-x-auto sm:overflow-y-auto flex sm:flex-col gap-1.5 sm:gap-2 bg-black/20 flex-shrink-0 no-scrollbar">
        <div className="hidden sm:flex text-xs font-semibold text-neutral-400 px-2 py-1 items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5" /> Photos
        </div>
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPhoto(p)}
            className={`flex-shrink-0 sm:w-full flex items-center gap-2 p-1.5 rounded-lg text-xs text-left transition-all ${
              selectedPhoto.id === p.id
                ? 'bg-blue-600 text-white'
                : 'text-neutral-300 hover:bg-white/10'
            }`}
          >
            <img src={p.url} alt={p.title} className="w-8 h-8 rounded object-cover" />
            <span className="hidden sm:inline truncate">{p.title}</span>
          </button>
        ))}
      </div>

      {/* 사진 상세 프리뷰 */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-black/40 overflow-hidden">
        <img
          src={selectedPhoto.url}
          alt={selectedPhoto.title}
          className="max-h-[240px] sm:max-h-[320px] rounded-xl shadow-2xl object-contain border border-white/10"
        />
        <span className="mt-2 text-xs text-neutral-400 font-medium">{selectedPhoto.title}</span>
      </div>
    </div>
  );
};

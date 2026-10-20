import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc3, Volume2 } from 'lucide-react';

export const MusicApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const playlist = [
    { title: 'New Days', artist: 'RESCENE (리센느)', duration: '3:15' },
    { title: 'YoYo', artist: 'RESCENE (리센느)', duration: '2:48' },
    { title: 'Love Attack', artist: 'RESCENE (리센느)', duration: '3:02' },
  ];

  return (
    <div className="p-5 flex flex-col items-center justify-center text-white h-full select-none">
      {/* 앨범 커버 회전 아트 */}
      <div className="relative my-3">
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white/20 ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '6s' }}
        >
          <div className="w-10 h-10 rounded-full bg-neutral-900 border-2 border-white/30 flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-pink-300" />
          </div>
        </div>
      </div>

      {/* 곡 정보 */}
      <div className="text-center mt-2">
        <h3 className="font-bold text-sm text-white drop-shadow">
          {playlist[currentTrack].title}
        </h3>
        <p className="text-xs text-neutral-300 mt-0.5">
          {playlist[currentTrack].artist}
        </p>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full max-w-[220px] mt-4">
        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all duration-300 ${
              isPlaying ? 'w-2/3' : 'w-1/4'
            }`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
          <span>{isPlaying ? '1:45' : '0:42'}</span>
          <span>{playlist[currentTrack].duration}</span>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="flex items-center gap-4 mt-3">
        <button
          onClick={() =>
            setCurrentTrack((prev) => (prev > 0 ? prev - 1 : playlist.length - 1))
          }
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={() =>
            setCurrentTrack((prev) => (prev < playlist.length - 1 ? prev + 1 : 0))
          }
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3 text-neutral-400 text-xs">
        <Volume2 className="w-3.5 h-3.5" />
        <span className="text-[10px]">BGM Player</span>
      </div>
    </div>
  );
};

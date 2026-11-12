import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Disc3, Volume2, VolumeX } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  duration: string;
  url: string;
  isLive?: boolean;
}

export const MusicApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 로열티 프리 잔잔한 코딩용 Lofi 배경음악 목록
  const playlist: Track[] = [
    {
      title: '24/7 Chillhop Lofi Radio',
      artist: 'FluxFM Berlin (Live Stream)',
      duration: 'LIVE',
      url: 'https://streams.fluxfm.de/Chillhop/mp3-320/streams.fluxfm.de/',
      isLive: true,
    },
    {
      title: 'Midnight Coding Beats',
      artist: 'Lofi Workspace Chill',
      duration: '3:30',
      url: '/audio/sample_lofi.mp3',
    },
    {
      title: 'Subway White Noise & Rain',
      artist: 'Ambient Soundscape',
      duration: '1:45',
      url: '/game/audio/subway_loop.mp3',
    },
  ];

  // 오디오 객체 초기화
  useEffect(() => {
    const audio = new Audio(playlist[currentTrack].url);
    audio.volume = volume;
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  // 볼륨 변경 시
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleNextTrack = () => {
    setCurrentTrack((prev) => (prev < playlist.length - 1 ? prev + 1 : 0));
  };

  const handlePrevTrack = () => {
    setCurrentTrack((prev) => (prev > 0 ? prev - 1 : playlist.length - 1));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-5 flex flex-col items-center justify-center text-white h-full select-none font-sans bg-gradient-to-b from-[#18181b] to-[#111113]">
      {/* 앨범 커버 회전 아트 */}
      <div className="relative my-2">
        <div
          className={`w-28 h-28 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white/20 transition-transform ${
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
      <div className="text-center mt-2 w-full px-4">
        <h3 className="font-bold text-sm text-white drop-shadow truncate">
          {playlist[currentTrack].title}
        </h3>
        <p className="text-xs text-neutral-400 mt-0.5 truncate">
          {playlist[currentTrack].artist}
        </p>
      </div>

      {/* 프로그레스 바 & 재생 시간 */}
      <div className="w-full max-w-[240px] mt-4 space-y-1">
        {playlist[currentTrack].isLive ? (
          <div className="flex items-center justify-center gap-1.5 py-1 text-xs text-rose-400 font-semibold font-mono animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>LIVE RADIO STREAMING</span>
          </div>
        ) : (
          <>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-pink-500 focus:outline-none"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
              <span>{formatTime(currentTime)}</span>
              <span>{duration && !isNaN(duration) ? formatTime(duration) : playlist[currentTrack].duration}</span>
            </div>
          </>
        )}
      </div>

      {/* 컨트롤 버튼 (이전 / 재생 / 다음) */}
      <div className="flex items-center gap-5 mt-3">
        <button
          onClick={handlePrevTrack}
          className="p-2 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
          title="이전 곡"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={togglePlay}
          className="w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
          title={isPlaying ? '일시정지' : '재생'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
        <button
          onClick={handleNextTrack}
          className="p-2 text-white/80 hover:text-white hover:scale-110 active:scale-95 transition-all"
          title="다음 곡"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* 볼륨 슬라이더 */}
      <div className="flex items-center gap-2 mt-4 text-neutral-400 text-xs w-full max-w-[180px]">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="hover:text-white transition-colors"
          title={isMuted ? '음소거 해제' : '음소거'}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => {
            setVolume(Number(e.target.value));
            if (isMuted) setIsMuted(false);
          }}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white/80 focus:outline-none"
        />
      </div>
    </div>
  );
};

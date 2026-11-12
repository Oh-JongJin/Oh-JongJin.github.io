import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Search, Apple, Moon, Sun, Zap, Info, Settings, MoonStar, RotateCcw } from 'lucide-react';

interface MenuBarProps {
  activeAppTitle: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  batteryPercent: number;
  isCharging: boolean;
  onOpenAboutMac?: () => void;
  onOpenSettings?: () => void;
  onOpenSpotlight?: () => void;
  onSleep?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeAppTitle,
  isDarkMode,
  onToggleDarkMode,
  batteryPercent,
  isCharging,
  onOpenAboutMac,
  onOpenSettings,
  onOpenSpotlight,
  onSleep,
}) => {
  const [time, setTime] = useState('');
  const [isAppleMenuOpen, setIsAppleMenuOpen] = useState(false);
  const appleMenuRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 사과 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (appleMenuRef.current && !appleMenuRef.current.contains(e.target as Node)) {
        setIsAppleMenuOpen(false);
      }
    };
    if (isAppleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAppleMenuOpen]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted =
        now.toLocaleDateString('ko-KR', {
          month: 'short',
          day: 'numeric',
          weekday: 'short',
        }) +
        ' ' +
        now.toLocaleTimeString('ko-KR', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      setTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 배터리 잔량에 따른 색상 (20% 이하면 빨간색, 충전 중이거나 정상이면 초록/흰색)
  const getBatteryFillColor = () => {
    if (isCharging) return '#30D158';
    if (batteryPercent <= 20) return '#FF453A';
    return '#FFFFFF';
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-2 sm:px-3 text-xs text-white/90 bg-black/35 backdrop-blur-xl border-b border-white/10 select-none">
      {/* 좌측: 사과 로고 & 활성 앱 이름 */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* 사과 로고 및 드롭다운 메뉴 */}
        <div className="relative" ref={appleMenuRef}>
          <button
            onClick={() => setIsAppleMenuOpen(!isAppleMenuOpen)}
            className={`flex items-center p-1 rounded hover:bg-white/10 transition-colors ${
              isAppleMenuOpen ? 'bg-white/20' : ''
            }`}
            title="애플 메뉴"
          >
            <Apple className="w-3.5 h-3.5 fill-current" />
          </button>

          {/* 사과 드롭다운 메뉴 */}
          {isAppleMenuOpen && (
            <div className="absolute top-7 left-0 w-52 rounded-xl bg-[#1e1e22]/95 border border-white/15 shadow-2xl py-1.5 backdrop-blur-2xl text-neutral-200 z-50 text-xs animate-fade-in font-sans">
              <button
                onClick={() => {
                  setIsAppleMenuOpen(false);
                  onOpenAboutMac?.();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span>이 Mac에 관하여</span>
              </button>

              <button
                onClick={() => {
                  setIsAppleMenuOpen(false);
                  onOpenSettings?.();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>시스템 설정...</span>
              </button>

              <div className="h-[1px] bg-white/10 my-1 mx-2" />

              <button
                onClick={() => {
                  setIsAppleMenuOpen(false);
                  onSleep?.();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <MoonStar className="w-3.5 h-3.5" />
                <span>잠자기</span>
              </button>

              <button
                onClick={() => {
                  setIsAppleMenuOpen(false);
                  window.location.reload();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-blue-600 hover:text-white flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>재시동...</span>
              </button>
            </div>
          )}
        </div>

        <span className="font-semibold text-white drop-shadow truncate max-w-[120px] sm:max-w-none">
          {activeAppTitle}
        </span>
        <div className="hidden md:flex items-center space-x-3 text-white/80">
          <button className="hover:text-white transition-colors">파일</button>
          <button className="hover:text-white transition-colors">편집</button>
          <button className="hover:text-white transition-colors">보기</button>
          <button className="hover:text-white transition-colors">이동</button>
          <button className="hover:text-white transition-colors">도움말</button>
        </div>
      </div>

      {/* 우측: 다크모드, 배터리, 와이파이 & 시계 */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-white/90">
        {/* 다크/라이트 모드 빠른 토글 */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? '다크 모드 (클릭하여 라이트 모드로 전환)' : '라이트 모드 (클릭하여 다크 모드로 전환)'}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors text-white/85 hover:text-white text-[11px]"
        >
          {isDarkMode ? (
            <Moon className="w-3 h-3 text-indigo-300" />
          ) : (
            <Sun className="w-3 h-3 text-amber-300" />
          )}
        </button>

        {/* 실제 잔량과 연동된 커스텀 macOS 배터리 아이콘 */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] sm:text-[11px] font-medium text-white/90">
            {batteryPercent}%
          </span>
          <div className="relative flex items-center">
            {/* 배터리 바디 */}
            <div className="w-5 h-2.5 rounded-[3px] border border-white/70 p-[1px] flex items-center">
              <div
                className="h-full rounded-[1px] transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(10, batteryPercent))}%`,
                  backgroundColor: getBatteryFillColor(),
                }}
              />
            </div>
            {/* 배터리 양극 돌기 */}
            <div className="w-[1.5px] h-1 bg-white/70 rounded-r-[1px] ml-[0.5px]" />
            {/* 충전 중 번개 표시 */}
            {isCharging && (
              <Zap className="absolute -left-1 w-3 h-3 text-amber-300 fill-amber-300 drop-shadow" />
            )}
          </div>
        </div>

        <Wifi className="w-3.5 h-3.5 hidden sm:inline" />
        <button
          onClick={onOpenSpotlight}
          className="hover:opacity-75 transition-opacity p-0.5"
          title="Spotlight 검색 (Cmd + Space)"
        >
          <Search className="w-3.5 h-3.5 hidden md:inline" />
        </button>
        <span className="font-medium tracking-tight text-white drop-shadow ml-0.5 text-[11px] sm:text-xs">
          {time}
        </span>
      </div>
    </div>
  );
};

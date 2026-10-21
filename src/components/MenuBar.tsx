import React, { useState, useEffect } from 'react';
import { Wifi, Search, Apple, Moon, Sun, Zap } from 'lucide-react';

interface MenuBarProps {
  activeAppTitle: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  batteryPercent: number;
  isCharging: boolean;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeAppTitle,
  isDarkMode,
  onToggleDarkMode,
  batteryPercent,
  isCharging,
}) => {
  const [time, setTime] = useState('');

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
        <button className="flex items-center hover:opacity-75 transition-opacity pl-1">
          <Apple className="w-3.5 h-3.5 fill-current" />
        </button>
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
        <Search className="w-3.5 h-3.5 hidden md:inline" />
        <span className="font-medium tracking-tight text-white drop-shadow ml-0.5 text-[11px] sm:text-xs">
          {time}
        </span>
      </div>
    </div>
  );
};

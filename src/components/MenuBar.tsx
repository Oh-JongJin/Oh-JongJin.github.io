import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Search, Apple, Moon, Sun } from 'lucide-react';

interface MenuBarProps {
  activeAppTitle: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  activeAppTitle,
  isDarkMode,
  onToggleDarkMode,
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

  return (
    <div className="fixed top-0 left-0 right-0 h-7 z-50 flex items-center justify-between px-3 text-xs text-white/90 bg-black/35 backdrop-blur-xl border-b border-white/10 select-none">
      {/* 좌측: 사과 로고 & 앱 메뉴 */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center hover:opacity-75 transition-opacity">
          <Apple className="w-3.5 h-3.5 fill-current" />
        </button>
        <span className="font-semibold text-white drop-shadow">{activeAppTitle}</span>
        <div className="hidden sm:flex items-center space-x-3 text-white/80">
          <button className="hover:text-white transition-colors">파일</button>
          <button className="hover:text-white transition-colors">편집</button>
          <button className="hover:text-white transition-colors">보기</button>
          <button className="hover:text-white transition-colors">이동</button>
          <button className="hover:text-white transition-colors">도움말</button>
        </div>
      </div>

      {/* 우측: 다크모드 토글, 상태 아이콘 & 시계 */}
      <div className="flex items-center space-x-3 text-white/90">
        {/* 다크/라이트 모드 상태 및 빠른 전환 버튼 */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? '다크 모드 (클릭하여 라이트 모드로 전환)' : '라이트 모드 (클릭하여 다크 모드로 전환)'}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/10 transition-colors text-white/85 hover:text-white text-[11px]"
        >
          {isDarkMode ? (
            <>
              <Moon className="w-3 h-3 text-indigo-300" />
              <span className="hidden sm:inline text-[10px]">다크</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline text-[10px]">라이트</span>
            </>
          )}
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90">100%</span>
          <Battery className="w-4 h-4" />
        </div>
        <Wifi className="w-3.5 h-3.5" />
        <Search className="w-3.5 h-3.5 hidden sm:inline" />
        <span className="font-medium tracking-tight text-white drop-shadow ml-1">{time}</span>
      </div>
    </div>
  );
};

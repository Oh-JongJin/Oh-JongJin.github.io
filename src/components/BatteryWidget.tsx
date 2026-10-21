import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BatteryWidgetProps {
  macbookPercent: number;
  isCharging: boolean;
  airpodsPercent: number;
  mousePercent: number;
}

interface BatteryItemProps {
  type: 'macbook' | 'airpods' | 'mouse' | 'empty';
  percent?: number;
  isCharging?: boolean;
}

const BatteryRing: React.FC<BatteryItemProps> = ({ type, percent, isCharging }) => {
  const size = 56;
  const strokeWidth = 4.5;
  const radius = 23;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = percent !== undefined ? circumference - (percent / 100) * circumference : circumference;

  return (
    <div className="flex flex-col items-center w-12 sm:w-14">
      {/* 원형 배터리 링 SVG */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full h-full transform -rotate-90">
          {/* 어두운 배경 트랙 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
          />
          {/* 형광 연두색 배터리 게이지 (채워진 부분) */}
          {percent !== undefined && (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#30D158"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* 중앙 기기 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center text-white/90 pointer-events-none">
          {type === 'macbook' && (
            <div className="relative">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="4" width="17" height="11.5" rx="1.5" fill="rgba(255,255,255,0.15)" stroke="currentColor" />
                <path d="M1.5 18.5h21a1.5 1.5 0 0 1-1.5 1.5h-18a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" stroke="none" />
                <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
              </svg>
              {isCharging && (
                <Zap className="absolute -top-1 -right-1 w-3 h-3 text-amber-300 fill-amber-300 drop-shadow" />
              )}
            </div>
          )}

          {type === 'airpods' && (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M14.5 5.5C12.5 4 8.5 5 7.5 7.5C6.5 10 8 12.5 10.5 13L10 18.5C10 19.3 10.7 20 11.5 20C12.3 20 13 19.3 13 18.5L13.5 13C16 12 17 9 16.5 7C16 5.5 15.5 6 14.5 5.5Z"
                fill="currentColor"
              />
              <ellipse cx="14" cy="8.5" rx="1.5" ry="2.2" fill="#202530" />
            </svg>
          )}

          {type === 'mouse' && (
            <svg width="18" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="5.5" y="3" width="13" height="18" rx="6.5" fill="currentColor" />
              <line x1="12" y1="5.5" x2="12" y2="9.5" stroke="#202530" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          )}

          {type === 'empty' && null}
        </div>
      </div>

      {/* 하단 잔량 텍스트 */}
      <span className="mt-1.5 text-[11px] sm:text-xs font-semibold text-white tracking-tight drop-shadow-sm min-h-[16px]">
        {percent !== undefined ? `${percent}%` : ''}
      </span>
    </div>
  );
};

export const BatteryWidget: React.FC<BatteryWidgetProps> = ({
  macbookPercent,
  isCharging,
  airpodsPercent,
  mousePercent,
}) => {
  // 모바일과 데스크톱에서의 초기 위치
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const GRID_SIZE = 80;
  const START_X = isMobile ? 12 : 28;
  const START_Y = isMobile ? 38 : 48;

  const [position, setPosition] = useState({ x: START_X, y: START_Y });

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const rawX = position.x + info.offset.x;
    const rawY = position.y + info.offset.y;

    const snappedX = Math.round((rawX - START_X) / GRID_SIZE) * GRID_SIZE + START_X;
    const snappedY = Math.round((rawY - START_Y) / GRID_SIZE) * GRID_SIZE + START_Y;

    const maxX = typeof window !== 'undefined' ? Math.max(START_X, window.innerWidth - 300) : 1000;
    const maxY = typeof window !== 'undefined' ? Math.max(START_Y, window.innerHeight - 140) : 800;

    const boundedX = Math.min(Math.max(START_X, snappedX), maxX);
    const boundedY = Math.min(Math.max(START_Y, snappedY), maxY);

    setPosition({ x: boundedX, y: boundedY });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.08}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 480, damping: 32 }}
      onDragEnd={handleDragEnd}
      className="absolute cursor-grab active:cursor-grabbing z-10 origin-top-left"
    >
      {/* 리퀴드 글래스 컨테이너 (모바일에서 적절한 크기로 패딩 조절) */}
      <div
        className="px-3.5 py-3 sm:px-5 sm:py-4 rounded-[22px] sm:rounded-[26px] flex items-center gap-2.5 sm:gap-4 select-none shadow-2xl transition-all"
        style={{
          background: 'rgba(20, 28, 44, 0.48)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        <BatteryRing type="macbook" percent={macbookPercent} isCharging={isCharging} />
        <BatteryRing type="airpods" percent={airpodsPercent} />
        <BatteryRing type="mouse" percent={mousePercent} />
        <BatteryRing type="empty" />
      </div>
    </motion.div>
  );
};

import React, { useState } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface BatteryItemProps {
  type: 'macbook' | 'airpods' | 'mouse' | 'empty';
  percent?: number;
}

const BatteryRing: React.FC<BatteryItemProps> = ({ type, percent }) => {
  const size = 56;
  const strokeWidth = 4.5;
  const radius = 23;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = percent ? circumference - (percent / 100) * circumference : circumference;

  return (
    <div className="flex flex-col items-center w-14">
      {/* 원형 배터리 링 SVG */}
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
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
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3.5" y="4" width="17" height="11.5" rx="1.5" fill="rgba(255,255,255,0.15)" stroke="currentColor" />
              <path d="M1.5 18.5h21a1.5 1.5 0 0 1-1.5 1.5h-18a1.5 1.5 0 0 1-1.5-1.5z" fill="currentColor" stroke="none" />
              <line x1="10.5" y1="18.5" x2="13.5" y2="18.5" stroke="rgba(0,0,0,0.4)" strokeWidth="1.2" />
            </svg>
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
      <span className="mt-2 text-xs font-semibold text-white tracking-tight drop-shadow-sm min-h-[16px]">
        {percent !== undefined ? `${percent}%` : ''}
      </span>
    </div>
  );
};

export const BatteryWidget: React.FC = () => {
  // macOS 데스크톱 기본 그리드 기준점 및 단위 (80px 격자 간격)
  const GRID_SIZE = 80;
  const START_X = 28;
  const START_Y = 48;

  const [position, setPosition] = useState({ x: START_X, y: START_Y });

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const rawX = position.x + info.offset.x;
    const rawY = position.y + info.offset.y;

    // 가장 가까운 격자(Grid) 위치로 반올림하여 스냅
    const snappedX = Math.round((rawX - START_X) / GRID_SIZE) * GRID_SIZE + START_X;
    const snappedY = Math.round((rawY - START_Y) / GRID_SIZE) * GRID_SIZE + START_Y;

    // 화면 영역 내로 제한
    const maxX = typeof window !== 'undefined' ? Math.max(START_X, window.innerWidth - 350) : 1000;
    const maxY = typeof window !== 'undefined' ? Math.max(START_Y, window.innerHeight - 160) : 800;

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
      className="absolute cursor-grab active:cursor-grabbing z-10"
    >
      {/* 리퀴드 글래스 컨테이너 */}
      <div
        className="px-5 py-4 rounded-[26px] flex items-center gap-4 select-none shadow-2xl transition-all"
        style={{
          background: 'rgba(20, 28, 44, 0.48)',
          backdropFilter: 'blur(30px) saturate(190%)',
          WebkitBackdropFilter: 'blur(30px) saturate(190%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.55), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)',
        }}
      >
        <BatteryRing type="macbook" percent={100} />
        <BatteryRing type="airpods" percent={88} />
        <BatteryRing type="mouse" percent={85} />
        <BatteryRing type="empty" />
      </div>
    </motion.div>
  );
};

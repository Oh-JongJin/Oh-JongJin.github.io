import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import folderIcon from '../assets/folder.png';
import githubIcon from '../assets/github.svg';

interface DesktopProps {
  onOpenApp: (appId: string) => void;
}

export const Desktop: React.FC<DesktopProps> = ({ onOpenApp }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDraggingRef = useRef(false);

  const desktopIcons = [
    {
      id: 'finder',
      title: 'Finder',
      iconUrl: folderIcon,
      onOpen: () => onOpenApp('about'),
    },
    {
      id: 'github',
      title: 'GitHub',
      iconUrl: githubIcon,
      onOpen: () => window.open('https://github.com/Oh-JongJin', '_blank'),
      isLink: true,
    },
  ];

  return (
    <div
      onClick={() => setSelectedId(null)}
      className="absolute inset-0 select-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* 우측 상단 시작 기준점 컨테이너 (모바일에서 적절한 여백과 크기 적용) */}
      <div className="absolute top-9 sm:top-11 right-2.5 sm:right-5 flex flex-col gap-4 sm:gap-6 pointer-events-none">
        {desktopIcons.map((item) => {
          const isSelected = selectedId === item.id;

          return (
            <motion.div
              key={item.id}
              drag
              dragMomentum={false}
              dragElastic={0}
              whileDrag={{ opacity: 0.75, scale: 1.03 }}
              onDragStart={() => {
                isDraggingRef.current = true;
                setSelectedId(item.id);
              }}
              onDragEnd={() => {
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 100);
              }}
              className="pointer-events-auto flex flex-col items-center w-20 sm:w-24 p-1 cursor-grab active:cursor-grabbing group"
              onClick={(e) => {
                e.stopPropagation();
                if (isDraggingRef.current) return;
                setSelectedId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isDraggingRef.current) return;
                item.onOpen();
              }}
            >
              {/* 아이콘 이미지 (모바일 w-12 h-12, 데스크톱 w-16 h-16) */}
              <img
                src={item.iconUrl}
                alt={item.title}
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)] pointer-events-none transition-transform group-active:scale-95"
                draggable={false}
              />

              {/* 실제 macOS 텍스트 라벨 */}
              <span
                className={`mt-1 sm:mt-1.5 text-[10px] sm:text-[11px] font-medium text-center leading-tight tracking-tight px-1.5 py-0.5 rounded pointer-events-none select-none ${
                  isSelected
                    ? 'bg-[#0058D0] text-white shadow-sm'
                    : 'text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)]'
                }`}
              >
                {item.title}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

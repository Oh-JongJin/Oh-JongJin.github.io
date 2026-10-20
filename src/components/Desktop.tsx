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
      {/* 우측 상단 시작 기준점 컨테이너 */}
      <div className="absolute top-11 right-5 flex flex-col gap-6 pointer-events-none">
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
                // 드래그 완료 후 단일/더블 클릭 오작동 방지용 짧은 딜레이
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 120);
              }}
              // 인위적인 회색 사각형 박스 및 hover 배경 제거 (실제 macOS 순정 스타일)
              className="pointer-events-auto flex flex-col items-center w-24 p-1 cursor-grab active:cursor-grabbing group"
              onClick={(e) => {
                e.stopPropagation();
                if (isDraggingRef.current) return;
                // 단일 클릭은 오직 "선택"만 수행 (링크/창 열리지 않음)
                setSelectedId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (isDraggingRef.current) return;
                // 실제 macOS처럼 반드시 "더블 클릭"해야만 열림
                item.onOpen();
              }}
            >
              {/* 아이콘 이미지 (macOS 순정 폴더 및 GitHub 공식 로고) */}
              <img
                src={item.iconUrl}
                alt={item.title}
                className="w-16 h-16 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.4)] pointer-events-none transition-transform group-active:scale-95"
                draggable={false}
              />

              {/* 실제 macOS 텍스트 라벨 (아이콘 선택 시에만 파란색 #0058D0 하이라이트 캡슐 적용) */}
              <span
                className={`mt-1.5 text-[11px] font-medium text-center leading-tight tracking-tight px-1.5 py-0.5 rounded pointer-events-none select-none ${
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

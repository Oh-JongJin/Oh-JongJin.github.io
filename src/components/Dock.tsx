import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, MotionValue } from 'framer-motion';

export interface DockAppItem {
  id: string;
  title: string;
  iconSrc: string;
  isOpen: boolean;
  isDividerBefore?: boolean;
  onClick: () => void;
}

interface DockProps {
  apps: DockAppItem[];
}

function DockIcon({
  item,
  mouseX,
  isMobile,
}: {
  item: DockAppItem;
  mouseX: MotionValue<number>;
  isMobile: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isBouncing, setIsBouncing] = useState(false);

  // 마우스 커서와 아이콘 중심점 사이의 거리 계산
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // 모바일과 데스크톱 비율 차등 적용
  // 데스크톱: 기본 44px -> 최대 68px
  // 모바일: 기본 34px -> 최대 48px
  const minW = isMobile ? 32 : 44;
  const maxW = isMobile ? 46 : 68;

  const widthSync = useTransform(distance, [-100, 0, 100], [minW, maxW, minW]);
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 180, damping: 15 });

  const handleClick = () => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 800);
    item.onClick();
  };

  return (
    <div className="flex items-end flex-shrink-0">
      {/* 우측 유틸리티 영역 앞의 세로 구분선 */}
      {item.isDividerBefore && (
        <div className="h-6 sm:h-9 w-[1px] bg-white/20 mx-1 sm:mx-1.5 self-center" />
      )}

      <div className="relative group flex flex-col items-center">
        {/* 툴팁 (모바일에서는 터치 시 가리지 않도록 데스크톱에서만 표시) */}
        <span className="hidden md:inline absolute -top-9 px-2.5 py-0.5 text-[11px] font-medium text-white/95 bg-neutral-900/80 backdrop-blur-md rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 shadow-lg z-50">
          {item.title}
        </span>

        <motion.div
          ref={ref}
          style={{ width: isMobile ? minW : width, height: isMobile ? minW : width }}
          animate={
            isBouncing
              ? { y: [0, -16, 0, -8, 0, -3, 0] }
              : { y: 0 }
          }
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          onClick={handleClick}
          whileTap={{ scale: 0.88 }}
          className="cursor-pointer flex items-center justify-center p-0.5"
        >
          {/* 실제 macOS 정품 고화질 앱 아이콘 이미지 */}
          <img
            src={item.iconSrc}
            alt={item.title}
            className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)] pointer-events-none select-none transition-transform"
            draggable={false}
          />
        </motion.div>

        {/* 실행 중 표시 점 (Active indicator dot) */}
        <div
          className={`w-1 h-1 rounded-full mt-0.5 transition-all duration-300 ${
            item.isOpen ? 'bg-white/90 scale-100' : 'bg-transparent scale-0'
          }`}
        />
      </div>
    </div>
  );
}

export const Dock: React.FC<DockProps> = ({ apps }) => {
  const mouseX = useMotionValue(Infinity);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="fixed bottom-1.5 sm:bottom-2 left-0 right-0 flex justify-center z-50 pointer-events-none px-2">
      <motion.div
        onMouseMove={(e) => !isMobile && mouseX.set(e.pageX)}
        onMouseLeave={() => !isMobile && mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[18px] sm:rounded-[22px] bg-white/25 dark:bg-black/40 backdrop-blur-3xl border border-white/20 shadow-2xl max-w-full overflow-x-auto select-none"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 1px 0 rgba(255,255,255,0.3)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {apps.map((app) => (
          <DockIcon key={app.id} item={app} mouseX={mouseX} isMobile={isMobile} />
        ))}
      </motion.div>
    </div>
  );
};

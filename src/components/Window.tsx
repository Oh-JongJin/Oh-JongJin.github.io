import React, { useState, useRef } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';

export interface WindowProps {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized?: boolean;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  hideTitleBar?: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  children: React.ReactNode;
}

export const Window: React.FC<WindowProps> = ({
  id: _id,
  title,
  isOpen,
  isMinimized = false,
  zIndex,
  initialX = 140,
  initialY = 70,
  initialWidth = 680,
  initialHeight = 460,
  hideTitleBar = false,
  onClose,
  onMinimize,
  onFocus,
  children,
}) => {
  // 모바일 화면 자동 감지 및 반응형 크기/위치 초기화
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const responsiveWidth = isMobile
    ? typeof window !== 'undefined'
      ? Math.min(window.innerWidth - 16, initialWidth)
      : initialWidth
    : initialWidth;
  const responsiveHeight = isMobile
    ? typeof window !== 'undefined'
      ? Math.min(window.innerHeight - 95, initialHeight)
      : initialHeight
    : initialHeight;

  const defaultX = isMobile ? 8 : initialX;
  const defaultY = isMobile ? 34 : initialY;

  const [isMaximized, setIsMaximized] = useState(false);
  const [size, setSize] = useState({ width: responsiveWidth, height: responsiveHeight });

  // 창의 x, y 위치 모션 값
  const x = useMotionValue(defaultX);
  const y = useMotionValue(defaultY);

  // 최대화 이전 크기/위치 복원용 ref
  const prevBounds = useRef({
    x: defaultX,
    y: defaultY,
    width: responsiveWidth,
    height: responsiveHeight,
  });

  // 상단 타이틀바만 드래그 가능하게 하는 dragControls
  const dragControls = useDragControls();

  const handleToggleMaximize = () => {
    if (!isMaximized) {
      prevBounds.current = {
        x: x.get(),
        y: y.get(),
        width: size.width,
        height: size.height,
      };
      x.set(0);
      y.set(28);
      setIsMaximized(true);
    } else {
      x.set(prevBounds.current.x);
      y.set(prevBounds.current.y);
      setSize({
        width: prevBounds.current.width,
        height: prevBounds.current.height,
      });
      setIsMaximized(false);
    }
  };

  // 창 테두리 리사이즈 핸들러 (왼쪽/상단 리사이즈 시 반대편 좌표 완벽 고정)
  const handleResizeStart = (direction: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFocus();

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const startXPos = x.get();
    const startYPos = y.get();

    const MIN_W = 340;
    const MIN_H = 220;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startClientX;
      const deltaY = moveEvent.clientY - startClientY;

      let nextWidth = startWidth;
      let nextHeight = startHeight;
      let nextX = startXPos;
      let nextY = startYPos;

      // 동쪽 (오른쪽으로 늘리기)
      if (direction.includes('e')) {
        nextWidth = Math.max(MIN_W, startWidth + deltaX);
      }

      // 서쪽 (왼쪽으로 늘리기: 오른쪽 모서리는 고정되고, 왼쪽 모서리와 x 좌표가 함께 이동)
      if (direction.includes('w')) {
        nextWidth = Math.max(MIN_W, startWidth - deltaX);
        const actualDeltaW = nextWidth - startWidth;
        nextX = startXPos - actualDeltaW;
      }

      // 남쪽 (아래쪽으로 늘리기)
      if (direction.includes('s')) {
        nextHeight = Math.max(MIN_H, startHeight + deltaY);
      }

      // 북쪽 (위쪽으로 늘리기: 아래쪽 모서리는 고정되고, 위쪽 모서리와 y 좌표가 함께 이동)
      if (direction.includes('n')) {
        nextHeight = Math.max(MIN_H, startHeight - deltaY);
        const actualDeltaH = nextHeight - startHeight;
        nextY = startYPos - actualDeltaH;
      }

      x.set(nextX);
      y.set(nextY);
      setSize({ width: nextWidth, height: nextHeight });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag={!isMaximized && !isMinimized}
      dragListener={false} // 본문 영역을 드래그해도 창이 움직이지 않음! (타이틀바만 드래그 가능)
      dragControls={dragControls}
      dragMomentum={false}
      onMouseDown={onFocus}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={
        isMinimized
          ? {
              // 실제 macOS 지니/스케일 효과: 하단 Dock으로 가늘어지며 쏙 빨려 들어감
              scaleX: 0.08,
              scaleY: 0.02,
              opacity: 0,
              transition: { duration: 0.35, ease: [0.35, 0, 0.65, 0.05] },
            }
          : {
              scale: 1,
              scaleX: 1,
              scaleY: 1,
              opacity: 1,
              borderRadius: isMaximized ? 0 : 18,
              transition: { duration: 0.2 },
            }
      }
      className={`absolute flex flex-col overflow-hidden mac-glass-dark text-white/90 mac-shadow border border-white/20 select-text ${
        isMaximized ? 'rounded-none' : 'rounded-[18px]'
      }`}
      style={{
        x,
        y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? 'calc(100vh - 28px)' : size.height,
        zIndex,
        pointerEvents: isMinimized ? 'none' : 'auto',
        WebkitMaskImage: isMaximized ? undefined : '-webkit-radial-gradient(white, black)',
      }}
    >
      {/* 1. 상단 타이틀 바 (hideTitleBar가 아닐 때만 렌더링) */}
      {!hideTitleBar && (
        <div
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            onFocus();
            dragControls.start(e);
          }}
          onDoubleClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('button')) return;
            handleToggleMaximize();
          }}
          className={`h-9 border-b flex items-center justify-between px-3.5 cursor-grab active:cursor-grabbing select-none relative z-10 ${
            _id === 'settings'
              ? 'bg-[#1c1c1e] border-white/5'
              : 'bg-white/10 border-white/10'
          }`}
        >
          {/* 신호등 트래픽 라이트 버튼 */}
          <div className="flex items-center space-x-2 group">
            {/* 빨강: 닫기 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              title="닫기"
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center hover:opacity-90"
            >
              <X className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>

            {/* 노랑: 하단 Dock으로 최소화 (지니 효과) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize();
              }}
              title="최소화"
              className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center hover:opacity-90"
            >
              <Minus className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>

            {/* 초록: 전체화면 토글 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleMaximize();
              }}
              title="전체화면"
              className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center hover:opacity-90"
            >
              <Maximize2 className="w-2 h-2 text-black/60 opacity-0 group-hover:opacity-100" />
            </button>
          </div>

          {/* 타이틀 텍스트 (시스템 설정 창일 때는 macOS 순정처럼 미표시) */}
          {_id !== 'settings' && (
            <span className="text-xs font-semibold text-white/80 tracking-wide pointer-events-none drop-shadow">
              {title}
            </span>
          )}

          {/* 좌우 균형 맞춤용 빈 박스 */}
          <div className="w-12" />
        </div>
      )}

      {/* 2. 창 내부 본문 (스크롤 및 텍스트 선택 가능) */}
      <div className="flex-1 overflow-auto bg-neutral-900/60 backdrop-blur-xl relative z-0 flex flex-col">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              onClose,
              onMinimize,
              onMaximize: handleToggleMaximize,
              isMaximized,
              dragControls,
              onFocus,
            })
          : children}
      </div>

      {/* 3. 창 가장자리 리사이즈 핸들 (실제 macOS처럼 완전 투명) */}
      {!isMaximized && (
        <>
          {/* 테두리 4방향 (상, 하, 좌, 우) */}
          <div
            onPointerDown={(e) => handleResizeStart('n', e)}
            className="absolute top-0 left-2 right-2 h-1.5 cursor-n-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizeStart('s', e)}
            className="absolute bottom-0 left-2 right-2 h-1.5 cursor-s-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizeStart('w', e)}
            className="absolute top-2 bottom-2 left-0 w-1.5 cursor-w-resize z-20"
          />
          <div
            onPointerDown={(e) => handleResizeStart('e', e)}
            className="absolute top-2 bottom-2 right-0 w-1.5 cursor-e-resize z-20"
          />

          {/* 모서리 4방향 (대각선) */}
          <div
            onPointerDown={(e) => handleResizeStart('nw', e)}
            className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizeStart('ne', e)}
            className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizeStart('sw', e)}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-30"
          />
          <div
            onPointerDown={(e) => handleResizeStart('se', e)}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-30"
          />
        </>
      )}
    </motion.div>
  );
};

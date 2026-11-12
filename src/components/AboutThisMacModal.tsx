import React from 'react';
import { Apple, X, Laptop } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AboutThisMacModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
  onOpenAboutMe?: () => void;
}

export const AboutThisMacModal: React.FC<AboutThisMacModalProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
  onOpenAboutMe,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[420px] rounded-2xl bg-[#1e1e20]/95 border border-white/20 text-white shadow-2xl overflow-hidden backdrop-blur-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 타이틀바 */}
          <div className="h-8 flex items-center px-3 border-b border-white/10 bg-white/5">
            <button
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center hover:opacity-90"
            >
              <X className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
            </button>
            <span className="text-[11px] font-semibold text-neutral-300 mx-auto -ml-3">
              이 Mac에 관하여
            </span>
          </div>

          {/* 본문 콘텐츠 */}
          <div className="p-6 flex flex-col items-center text-center">
            {/* 맥북/사과 비주얼 */}
            <div className="relative my-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-neutral-800 via-neutral-700 to-neutral-600 flex items-center justify-center border border-white/15 shadow-inner">
                <Apple className="w-10 h-10 text-white fill-current drop-shadow" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mt-3">
              MacBook Pro
            </h2>
            <p className="text-xs text-neutral-400 font-medium">16형, 2026</p>

            {/* 스펙 명세 */}
            <div className="w-full mt-5 space-y-2 text-xs bg-white/5 rounded-xl p-3.5 border border-white/5 text-left">
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">칩</span>
                <span className="font-semibold text-neutral-200">Apple M3 Pro (with Passion)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">메모리</span>
                <span className="font-semibold text-neutral-200">32 GB 통합 호기심 & 학습력</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">개발자</span>
                <span className="font-semibold text-amber-300">오종진 (JongJin Oh)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">일련 번호</span>
                <span className="font-mono text-neutral-300">JONGJIN-2026-DEV</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-neutral-400">macOS</span>
                <span className="font-semibold text-neutral-200">Sonoma 14.5 Web Edition</span>
              </div>
            </div>

            {/* 하단 액션 버튼들 */}
            <div className="flex items-center gap-2 mt-5 w-full">
              <button
                onClick={() => {
                  onClose();
                  onOpenAboutMe?.();
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow"
              >
                추가 정보 (About Me)...
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings?.();
                }}
                className="py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white text-xs font-semibold transition-colors border border-white/10"
              >
                시스템 설정...
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

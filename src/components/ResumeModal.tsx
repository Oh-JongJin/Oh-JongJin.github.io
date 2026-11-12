import React from 'react';
import { X, Download, Printer, ExternalLink, Mail, Github, MapPin, Sparkles, Award, Code2, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md select-none overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#1e1e22] border border-white/20 rounded-2xl shadow-2xl overflow-hidden text-neutral-100 my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 윈도우 타이틀바 */}
          <div className="h-10 bg-[#161618] border-b border-white/10 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center hover:opacity-90"
              >
                <X className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
              </button>
              <span className="text-xs font-semibold text-neutral-300 ml-2">
                이력서_오종진.pdf — 미리보기
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
                title="인쇄 또는 PDF로 저장"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">인쇄 / PDF 저장</span>
              </button>
            </div>
          </div>

          {/* 본문 서류 영역 (종이 질감 느낌) */}
          <div className="p-6 sm:p-8 max-h-[80vh] overflow-y-auto space-y-6 text-neutral-200 font-sans">
            {/* 프로필 헤더 */}
            <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">오종진</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Developer
                  </span>
                </div>
                <p className="text-sm text-neutral-400 mt-1">
                  호기심과 새로운 기술 탐구를 바탕으로 직관적인 사용자 경험을 창조하는 개발자
                </p>
              </div>

              <div className="text-xs text-neutral-300 space-y-1 sm:text-right">
                <div className="flex items-center sm:justify-end gap-1.5 text-neutral-300">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <a href="mailto:5jx2oh@gmail.com" className="hover:text-blue-400">
                    5jx2oh@gmail.com
                  </a>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 text-neutral-300">
                  <Github className="w-3.5 h-3.5 text-neutral-400" />
                  <a href="https://github.com/Oh-JongJin" target="_blank" rel="noreferrer" className="hover:text-blue-400">
                    github.com/Oh-JongJin
                  </a>
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5" />
                  Seoul, Korea
                </div>
              </div>
            </div>

            {/* 기술 역량 (Tech Stack) */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-sky-400" /> 기술 역량 (Tech Stack)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-neutral-200">Programming Languages</span>
                  <p className="text-neutral-400 mt-1">C++, Python, TypeScript, JavaScript</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-neutral-200">Frontend & Frameworks</span>
                  <p className="text-neutral-400 mt-1">React, Next.js, Tailwind CSS, Framer Motion, Qt</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-neutral-200">Data & Tools</span>
                  <p className="text-neutral-400 mt-1">Streamlit, Git / GitHub, Linux / macOS</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="font-semibold text-neutral-200">Game & Graphics</span>
                  <p className="text-neutral-400 mt-1">HTML5 2D Canvas, Godot Engine</p>
                </div>
              </div>
            </div>

            {/* 주요 프로젝트 */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" /> 주요 프로젝트 (Projects)
              </h2>
              <div className="space-y-3 text-xs">
                {/* 1. macOS Web Portfolio */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-100 text-sm">macOS Web Portfolio</span>
                    <span className="text-[10px] text-neutral-400 font-mono">React · TypeScript · Tailwind · Motion</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    macOS Sonoma 데스크톱의 윈도우 관리, Dock 애니메이션, 시스템 설정, 다크모드, 텔레그램 알림 연동 메시지 앱을 웹상에 정밀하게 재현한 포트폴리오.
                  </p>
                </div>

                {/* 2. Personal Workspace */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-100 text-sm">Personal Workspace (myPage)</span>
                    <span className="text-[10px] text-neutral-400 font-mono">Python · Streamlit · GitHub API</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    개인 기록, 블로그, 생산성 도구를 통합하여 한눈에 관리할 수 있는 Streamlit 기반 대시보드 워크스페이스 구축.
                  </p>
                </div>

                {/* 3. 2D Retro RPG */}
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-100 text-sm">2D 레트로 RPG '안녕' 웹 포팅</span>
                    <span className="text-[10px] text-neutral-400 font-mono">HTML5 Canvas · TypeScript · Godot</span>
                  </div>
                  <p className="text-neutral-300 leading-relaxed">
                    지하철 5호선 탐험 쯔꾸르 스타일 어드벤처 게임. 스프라이트 걷기 모션, 4방향 충돌 판정, 모바일 가상 조이스틱 터치 제스처를 웹 캔버스 엔진으로 100% 포팅.
                  </p>
                </div>
              </div>
            </div>

            {/* 강점 및 핵심 가치 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-400/20 text-xs space-y-1.5">
              <span className="font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 문제 해결과 디테일에 대한 집착
              </span>
              <p className="text-neutral-300 leading-relaxed">
                사용자가 마주하는 인터페이스의 1픽셀 오차와 미세한 조작감도 놓치지 않으며, 새로운 기술을 빠르게 습득하여 실제 서비스에 녹여내는 것을 즐깁니다.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

import React from 'react';
import { Mail, Github, MapPin, Sparkles } from 'lucide-react';

export const AboutMeApp: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 sm:space-y-6">
      {/* 프로필 헤더 (모바일 반응형 중앙 정렬 및 폰트 축소 대응) */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-5 pb-5 sm:pb-6 border-b border-white/10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl flex-shrink-0">
          <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-2xl sm:text-3xl font-bold">
            👨‍💻
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white">오종진 (JongJin Oh)</h1>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            호기심과 새로운 기술 탐구를 좋아하는 개발자
          </p>
          <div className="flex items-center justify-center sm:justify-start flex-wrap gap-3 sm:gap-4 mt-2.5 text-xs text-neutral-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Seoul, Korea
            </span>
            <a
              href="mailto:5jx2oh@gmail.com"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> 5jx2oh@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* 소개 본문 */}
      <div className="space-y-2">
        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-400">About</h2>
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-200">
          안녕하세요! 인터랙티브하고 직관적인 사용자 경험(UX)을 만드는 것을 좋아합니다. 
          이 웹사이트는 macOS 데스크톱 환경에서 영감을 받아 React와 Tailwind CSS로 제작한 저만의 포트폴리오 공간입니다.
        </p>
      </div>

      {/* 기술 스택 */}
      <div className="space-y-2.5">
        <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-400">Tech Stack</h2>
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          {['C++', 'Python', 'Qt', 'Streamlit', 'Git'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/10 hover:bg-white/20 transition-colors"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 링크 버튼 */}
      <div className="pt-2 text-center sm:text-left">
        <a
          href="https://github.com/Oh-JongJin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium border border-white/20 transition-all text-white w-full sm:w-auto"
        >
          <Github className="w-4 h-4" />
          GitHub 프로필 방문하기
        </a>
      </div>
    </div>
  );
};

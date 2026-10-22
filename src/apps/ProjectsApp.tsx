import React from 'react';
import { ExternalLink, FolderGit2, Gamepad2 } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  actionText?: string;
  onAction?: () => void;
}

interface ProjectsAppProps {
  onOpenGame?: () => void;
}

export const ProjectsApp: React.FC<ProjectsAppProps> = ({ onOpenGame }) => {
  const projects: Project[] = [
    {
      title: 'macOS Web Portfolio',
      description: 'macOS Sonoma 데스크톱 UI와 인터랙션을 웹 브라우저 상에 재현한 인터랙티브 웹 포트폴리오.',
      tags: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
      link: 'https://github.com/Oh-JongJin/macos-portfolio',
    },
    {
      title: 'Personal Workspace (myPage)',
      description: '개인 블로그 및 기록, 다양한 도구를 하나로 통합한 Streamlit 기반 워크스페이스.',
      tags: ['Python', 'Streamlit', 'GitHub API'],
      link: 'https://github.com/Oh-JongJin/myPage',
    },
    {
      title: '지하철 5호선 — 소개팅 가는 길 (2D 레트로 RPG)',
      description: 'Godot 엔진으로 제작된 2D 쯔꾸르 스타일 지하철 탐험 게임. 웹 캔버스 엔진으로 100% 포팅 완료!',
      tags: ['Game Dev', 'HTML5 Canvas', 'Pixel Art', 'Godot Port'],
      actionText: '게임 플레이하기 ▶',
      onAction: onOpenGame,
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-sky-400" />
          Projects ({projects.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.08] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-white text-sm">{project.title}</h3>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                {project.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {project.actionText && (
                <button
                  onClick={project.onAction}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-all hover:scale-105"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  {project.actionText}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

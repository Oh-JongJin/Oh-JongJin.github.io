import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  FolderGit2,
  Terminal,
  MessageCircle,
  FileText,
  Gamepad2,
  Settings,
  Image as ImageIcon,
  Music,
  Trash2,
  User,
  FileDown,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onOpenResume?: () => void;
}

interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: '앱' | '문서' | '프로젝트';
  icon: React.ReactNode;
  action: () => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onOpenApp,
  onOpenResume,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: SearchItem[] = [
    {
      id: 'about',
      title: 'Finder (About Me)',
      description: '개발자 오종진 소개, 보유 스킬, 경력 및 연락처',
      category: '앱',
      icon: <User className="w-5 h-5 text-indigo-400" />,
      action: () => onOpenApp('about'),
    },
    {
      id: 'projects',
      title: 'Projects',
      description: 'macOS Web Portfolio, 개인 워크스페이스, 레트로 게임 등 프로젝트 목록',
      category: '프로젝트',
      icon: <FolderGit2 className="w-5 h-5 text-sky-400" />,
      action: () => onOpenApp('projects'),
    },
    {
      id: 'resume',
      title: '이력서 (Resume.pdf)',
      description: '오종진 상세 이력서 미리보기 및 PDF 다운로드',
      category: '문서',
      icon: <FileDown className="w-5 h-5 text-emerald-400" />,
      action: () => onOpenResume?.(),
    },
    {
      id: 'game',
      title: '안녕 (지하철 5호선 2D RPG)',
      description: 'HTML5 캔버스로 포팅된 2D 레트로 쯔꾸르 지하철 탐험 게임',
      category: '앱',
      icon: <Gamepad2 className="w-5 h-5 text-amber-400" />,
      action: () => onOpenApp('game'),
    },
    {
      id: 'messages',
      title: '메시지 (Messages)',
      description: 'iMessage 인터페이스 & 텔레그램 실시간 알림 연동 채팅',
      category: '앱',
      icon: <MessageCircle className="w-5 h-5 text-emerald-400" />,
      action: () => onOpenApp('messages'),
    },
    {
      id: 'notes',
      title: '메모 (Notes)',
      description: '네이버 블로그 기술 포스팅 연동 마크다운 뷰어 & 노트',
      category: '앱',
      icon: <FileText className="w-5 h-5 text-yellow-400" />,
      action: () => onOpenApp('notes'),
    },
    {
      id: 'terminal',
      title: 'Terminal (터미널)',
      description: 'whoami, projects, help 명령어 지원 zsh 웹 터미널',
      category: '앱',
      icon: <Terminal className="w-5 h-5 text-emerald-300" />,
      action: () => onOpenApp('terminal'),
    },
    {
      id: 'settings',
      title: '시스템 설정 (Settings)',
      description: '다크모드, 배터리 상태, 디바이스 스펙 상세 확인',
      category: '앱',
      icon: <Settings className="w-5 h-5 text-neutral-400" />,
      action: () => onOpenApp('settings'),
    },
    {
      id: 'music',
      title: '음악 (Music BGM)',
      description: '코딩용 잔잔한 로파이(Lofi) 배경음악 플레이어',
      category: '앱',
      icon: <Music className="w-5 h-5 text-pink-400" />,
      action: () => onOpenApp('music'),
    },
    {
      id: 'photos',
      title: '사진 (Photos)',
      description: '풍경 사진 갤러리 앨범',
      category: '앱',
      icon: <ImageIcon className="w-5 h-5 text-rose-400" />,
      action: () => onOpenApp('photos'),
    },
    {
      id: 'trash',
      title: '휴지통 (Trash)',
      description: '버려진 버그들과 야근 기록 이스터에그',
      category: '앱',
      icon: <Trash2 className="w-5 h-5 text-neutral-400" />,
      action: () => onOpenApp('trash'),
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-24 sm:pt-32 px-4 bg-black/45 backdrop-blur-sm select-none"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: -10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: -10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className="w-full max-w-xl rounded-2xl bg-[#1c1c1e]/90 border border-white/20 shadow-2xl overflow-hidden backdrop-blur-3xl text-white"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 검색 인풋창 */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search className="w-5 h-5 text-neutral-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Spotlight 검색 (앱, 프로젝트, 이력서...)"
              className="w-full bg-transparent border-none outline-none text-base sm:text-lg text-white placeholder-neutral-500 font-sans"
            />
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-neutral-400">
              ESC로 닫기
            </span>
          </div>

          {/* 검색 결과 리스트 */}
          <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedIndex === idx ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white/10 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate">
                        {item.title}
                      </div>
                      <div
                        className={`text-[11px] truncate ${
                          selectedIndex === idx ? 'text-blue-100' : 'text-neutral-400'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        selectedIndex === idx
                          ? 'bg-blue-700 text-white'
                          : 'bg-white/10 text-neutral-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    {selectedIndex === idx && (
                      <ArrowRight className="w-3.5 h-3.5 text-white hidden sm:block" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

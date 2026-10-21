import React, { useState, useEffect } from 'react';
import blogPostsData from '../data/blogPosts.json';
import {
  Folder,
  ExternalLink,
  Share2,
  Search,
  SquarePen,
  MoreHorizontal,
  Table,
  Paperclip,
  CheckSquare,
  PanelLeft,
  Sparkles,
  Sliders,
  X,
  Minus,
  Maximize2,
} from 'lucide-react';

export interface BlogPost {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  thumbnail?: string | null;
}

export interface NotesAppProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  dragControls?: any;
  onFocus?: () => void;
}

export const NotesApp: React.FC<NotesAppProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  dragControls,
  onFocus,
}) => {
  const posts: BlogPost[] = blogPostsData;

  // 기본 선택된 메모 (첫 번째 블로그 글)
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || 'new');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 실시간 동기화용 현재 시간 헬퍼 함수들
  const getCurrentTimeShort = () => {
    const d = new Date();
    const hour = d.getHours();
    const minute = d.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? '오후' : '오전';
    const formattedHour = hour % 12 || 12;
    return `${ampm} ${formattedHour}:${minute}`;
  };

  const getCurrentDetailDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? '오후' : '오전';
    const formattedHour = hour % 12 || 12;
    return `${year}년 ${month}월 ${day}일 ${ampm} ${formattedHour}:${minute}`;
  };

  // 실시간 시계 상태 (실제 현재 시각과 1초마다 자동 동기화)
  const [currentTimeShort, setCurrentTimeShort] = useState<string>(getCurrentTimeShort);
  const [currentDetailDate, setCurrentDetailDate] = useState<string>(getCurrentDetailDate);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeShort(getCurrentTimeShort());
      setCurrentDetailDate(getCurrentDetailDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 새 메모 작성용 상태
  const [customMemo, setCustomMemo] = useState({
    title: '새로운 메모',
    content: '',
  });

  const selectedPost = posts.find((p) => p.id === selectedPostId);

  // 날짜 포맷팅 헬퍼 (예: "2026. 10. 16.")
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
    } catch {
      return dateStr;
    }
  };

  // 상세 작성일자 포맷 (예: "2026년 10월 16일 오후 10:12")
  const formatDetailDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const hour = d.getHours();
      const minute = d.getMinutes().toString().padStart(2, '0');
      const ampm = hour >= 12 ? '오후' : '오전';
      const formattedHour = hour % 12 || 12;
      return `${year}년 ${month}월 ${day}일 ${ampm} ${formattedHour}:${minute}`;
    } catch {
      return dateStr;
    }
  };

  // 검색 필터링
  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#1e1e20] text-[#e0e0e0] font-sans select-none overflow-hidden text-[13px] ${
        isMaximized ? 'rounded-none' : 'rounded-[18px]'
      }`}
      onClick={() => onFocus?.()}
    >
      {/* ======================= 상단 통합 툴바 (스크린샷 100% 일치) ======================= */}
      <div
        onPointerDown={(e) => {
          // 버튼, 입력창, 링크 클릭 시에는 창 드래그 방지
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('input') || target.closest('a')) {
            return;
          }
          onFocus?.();
          dragControls?.start(e);
        }}
        onDoubleClick={(e) => {
          // 버튼 클릭 시에는 최대화 방지, 툴바 빈 공간 더블 클릭 시에만 최대화
          const target = e.target as HTMLElement;
          if (target.closest('button') || target.closest('input') || target.closest('a')) {
            return;
          }
          onMaximize?.();
        }}
        className={`h-11 bg-[#202022] border-b border-[#2d2d30] flex items-center justify-between px-3.5 select-none flex-shrink-0 cursor-grab active:cursor-grabbing ${
          isMaximized ? 'rounded-none' : 'rounded-t-[18px]'
        }`}
      >
        {/* 좌측: 신호등 트래픽 라이트 + 사이드바 토글 + 폴더 정보 */}
        <div
          className="flex items-center gap-2.5"
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {/* macOS 신호등 (Red, Yellow, Green) 버튼 */}
          <div className="flex items-center space-x-2 mr-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose?.();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="닫기"
              className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center hover:opacity-90 cursor-default"
            >
              <X className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize?.();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="최소화"
              className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center hover:opacity-90 cursor-default"
            >
              <Minus className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMaximize?.();
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="전체화면"
              className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center hover:opacity-90 cursor-default"
            >
              <Maximize2 className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
            </button>
          </div>

          {/* 사이드바 열기/닫기 토글 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen((prev) => !prev);
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title="사이드바 가리기 / 보기"
            className="p-1 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-default"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* 폴더 타이틀 및 메모 개수 */}
          <div className="flex flex-col ml-1 pointer-events-none">
            <span className="font-bold text-white text-xs leading-none">모든 iCloud</span>
            <span className="text-[10px] text-[#8e8e93] mt-0.5 leading-none">
              {posts.length + 1}개의 메모 (네이버 블로그 연동)
            </span>
          </div>

          {/* 더보기 타원형 캡슐 버튼 */}
          <button
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title="폴더 동작"
            className="px-2 py-0.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-default border border-white/5 ml-1"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* 세로 구분선 */}
          <div className="w-px h-3.5 bg-white/10 mx-0.5 pointer-events-none" />

          {/* 새 메모 작성 사각 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPostId('new');
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            title="새로운 메모 작성"
            className="p-1.5 rounded-lg hover:bg-white/10 text-amber-400 hover:text-amber-300 transition-colors cursor-default border border-white/5"
          >
            <SquarePen className="w-4 h-4" />
          </button>
        </div>

        {/* 중앙: 서식 및 도구 캡슐 바 (스크린샷과 일치) */}
        <div
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="hidden md:flex items-center gap-3 px-3 py-1 rounded-lg bg-[#28282a] border border-white/5 text-neutral-400 cursor-default"
        >
          <button
            title="텍스트 서식"
            className="font-semibold text-xs text-neutral-300 hover:text-white transition-colors cursor-default"
          >
            가가
          </button>
          <button
            title="체크리스트"
            className="hover:text-white transition-colors cursor-default"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            title="표 추가"
            className="hover:text-white transition-colors cursor-default"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            title="파일 첨부"
            className="hover:text-white transition-colors cursor-default"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <button
            title="Apple Intelligence"
            className="hover:text-amber-300 text-amber-400 transition-colors cursor-default"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 우측: 공유 및 검색 */}
        <div
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-2 text-neutral-400 cursor-default"
        >
          {selectedPost && (
            <button
              onClick={() => window.open(selectedPost.link, '_blank')}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="네이버 블로그 원문 새 창으로 열기"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#03C75A]/20 hover:bg-[#03C75A]/30 text-[#03C75A] hover:text-[#00E065] text-xs font-semibold border border-[#03C75A]/40 transition-all cursor-default"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="hidden sm:inline">원문 열기</span>
            </button>
          )}

          {/* 공유 및 메뉴 캡슐 */}
          <div className="flex items-center rounded-lg bg-[#28282a] border border-white/5 p-0.5">
            <button
              title="공유"
              onClick={() => {
                if (navigator.share && selectedPost) {
                  navigator.share({ title: selectedPost.title, url: selectedPost.link }).catch(() => {});
                } else if (selectedPost) {
                  navigator.clipboard.writeText(selectedPost.link);
                  alert('블로그 링크가 클립보드에 복사되었습니다.');
                }
              }}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-default"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              title="더보기"
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-default"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 검색 기능 */}
          {isSearchOpen ? (
            <div className="flex items-center bg-[#28282a] rounded-lg px-2 py-0.5 border border-white/10">
              <Search className="w-3 h-3 text-neutral-400 mr-1.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onDoubleClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                placeholder="검색..."
                autoFocus
                className="bg-transparent text-xs text-white outline-none w-24 sm:w-36 placeholder:text-neutral-500"
              />
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="text-neutral-400 hover:text-white text-xs ml-1"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              onDoubleClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              title="메모 검색"
              className="p-1.5 rounded-lg bg-[#28282a] border border-white/5 hover:bg-white/10 hover:text-white transition-colors cursor-default"
            >
              <Search className="w-3.5 h-3.5 text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {/* ======================= 메인 콘텐츠 (사이드바 + 본문) ======================= */}
      <div className="flex flex-1 overflow-hidden">
        {/* 좌측 메모 리스트 사이드바 (스크린샷 레이아웃 100% 일치) */}
        {isSidebarOpen && (
          <div
            className={`w-[260px] sm:w-[280px] flex-shrink-0 bg-[#1b1b1d] border-r border-[#2d2d30] flex flex-col h-full ${
              isMaximized ? 'rounded-none' : 'rounded-bl-[18px]'
            }`}
          >
            <div className="flex-1 overflow-y-auto px-2.5 py-2.5 space-y-3 no-scrollbar">
              {/* 오늘 그룹 */}
              <div className="space-y-1">
                <div className="px-3 text-xs font-bold text-white tracking-tight">오늘</div>

                {/* 새로운 메모 카드 */}
                <div
                  onClick={() => setSelectedPostId('new')}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    selectedPostId === 'new'
                      ? 'bg-[#343436] text-white shadow-md ring-1 ring-white/10'
                      : 'hover:bg-white/5 text-neutral-300'
                  }`}
                >
                  <div className="font-semibold text-white text-xs truncate">
                    {customMemo.title || '새로운 메모'}
                  </div>
                  <div className="text-[11px] text-[#8e8e93] mt-0.5 truncate">
                    {/* 실시간 현재 시각과 연동 */}
                    <span className="font-medium text-neutral-300">{currentTimeShort}</span>{' '}
                    {customMemo.content ? customMemo.content.slice(0, 30) : '추가 텍스트 없음'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8e8e93] mt-1">
                    <Folder className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>메모</span>
                  </div>
                </div>
              </div>

              {/* 이전 그룹 (사용자 요청: "이전 30일" -> "이전") */}
              <div className="space-y-0.5 pt-2">
                <div className="px-3 pb-1 text-xs font-bold text-white tracking-tight">
                  이전
                </div>

                {filteredPosts.map((post, idx) => {
                  const isSelected = selectedPostId === post.id;

                  return (
                    <div key={post.id}>
                      <div
                        onClick={() => setSelectedPostId(post.id)}
                        className={`p-3 rounded-xl cursor-pointer transition-all flex items-start justify-between gap-2.5 ${
                          isSelected
                            ? 'bg-[#343436] text-white shadow-md ring-1 ring-white/10'
                            : 'hover:bg-white/5 text-neutral-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          {/* 메모 제목 */}
                          <div className="font-semibold text-white text-xs truncate leading-snug">
                            {post.title}
                          </div>

                          {/* 날짜 + 요약 미리보기 */}
                          <div className="text-[11px] text-[#8e8e93] mt-0.5 truncate">
                            <span className="font-medium text-neutral-300">
                              {formatDate(post.pubDate)}
                            </span>{' '}
                            {post.summary ? post.summary.slice(0, 35) : '네이버 블로그 포스팅...'}
                          </div>

                          {/* 폴더 표시 */}
                          <div className="flex items-center gap-1.5 text-[10px] text-[#8e8e93] mt-1">
                            <Folder className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span>메모</span>
                          </div>
                        </div>

                        {/* 썸네일 이미지 (스크린샷의 unknown.png 항목처럼 우측 사각 박스 배치) */}
                        {post.thumbnail && (
                          <div className="w-11 h-11 rounded-lg bg-neutral-800 border border-white/10 overflow-hidden flex-shrink-0 shadow-sm mt-0.5">
                            <img
                              src={post.thumbnail}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* 미선택 항목 사이의 은은한 가로 구분선 */}
                      {!isSelected && idx < filteredPosts.length - 1 && (
                        <div className="border-b border-[#2d2d30]/50 mx-3 my-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================= 우측 메모 본문 에디터 / 뷰어 ======================= */}
        <div
          className={`flex-1 flex flex-col h-full bg-[#18181a] overflow-y-auto p-6 md:p-8 ${
            isMaximized ? 'rounded-none' : 'rounded-br-[18px]'
          }`}
        >
          {selectedPostId === 'new' ? (
            /* 직접 메모를 작성할 수 있는 macOS 순정 에디터 */
            <div className="max-w-2xl mx-auto w-full space-y-4">
              {/* 실시간 현재 일시 동기화 */}
              <div className="text-center text-xs text-[#8e8e93]">
                {currentDetailDate}
              </div>

              <input
                type="text"
                value={customMemo.title}
                onChange={(e) =>
                  setCustomMemo((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="제목 없음"
                className="w-full bg-transparent text-2xl font-bold text-white outline-none placeholder:text-neutral-600"
                style={{
                  caretColor: '#F59E0B', // 실제 macOS 메모의 시그니처 앰버 커서
                }}
              />

              <textarea
                value={customMemo.content}
                onChange={(e) =>
                  setCustomMemo((prev) => ({ ...prev, content: e.target.value }))
                }
                placeholder="여기에 자유롭게 메모를 작성하세요..."
                className="w-full h-[380px] bg-transparent text-sm leading-relaxed text-neutral-200 outline-none resize-none placeholder:text-neutral-600 font-sans"
                style={{
                  caretColor: '#F59E0B',
                }}
              />
            </div>
          ) : selectedPost ? (
            /* 네이버 블로그 글을 macOS 메모지 스타일로 렌더링 */
            <div className="max-w-2xl mx-auto w-full space-y-5">
              {/* 상단 작성 일시 (가운데 정렬) */}
              <div className="text-center text-xs text-[#8e8e93]">
                {formatDetailDate(selectedPost.pubDate)}
              </div>

              {/* 글 제목 */}
              <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {selectedPost.title}
              </h1>

              {/* 네이버 블로그 연동 카드 배너 */}
              <div className="p-3.5 rounded-xl bg-[#222225] border border-white/10 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3 truncate mr-3">
                  <div className="w-8 h-8 rounded-lg bg-[#03C75A] flex items-center justify-center text-white font-extrabold text-sm shadow flex-shrink-0">
                    N
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-white">oricori님의 네이버 블로그</div>
                    <div className="text-[11px] text-[#8e8e93] truncate">{selectedPost.link}</div>
                  </div>
                </div>

                <a
                  href={selectedPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03C75A] hover:bg-[#02b350] text-white text-xs font-semibold shadow transition-colors flex-shrink-0"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  블로그에서 전체 읽기
                </a>
              </div>

              {/* 대표 썸네일 이미지 */}
              {selectedPost.thumbnail && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-neutral-900 max-h-[340px] flex items-center justify-center shadow-lg">
                  <img
                    src={selectedPost.thumbnail}
                    alt={selectedPost.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* 본문 요약 내용 */}
              <div className="text-sm leading-relaxed text-[#d1d1d6] whitespace-pre-line bg-[#222225]/60 p-5 rounded-xl border border-white/5">
                {selectedPost.summary ||
                  '본문 내용 요약이 없습니다. 상단 [블로그에서 전체 읽기] 버튼을 눌러 네이버 블로그에서 전체 포스팅을 확인해 보세요.'}
              </div>

              {/* 하단 블로그 원문 안내 */}
              <div className="pt-4 border-t border-white/5 text-center text-xs text-[#8e8e93] flex items-center justify-center gap-2">
                <span>💡 종진님의 네이버 블로그(oricori)에서 연동된 메모입니다.</span>
                <a
                  href={selectedPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#03C75A] hover:underline flex items-center gap-0.5 font-medium"
                >
                  원문 링크
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
              <Folder className="w-12 h-12 stroke-[1.2] mb-2" />
              <span>선택된 메모가 없습니다.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

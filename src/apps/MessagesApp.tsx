import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Minus,
  Maximize2,
  Search,
  SquarePen,
  Video,
  Phone,
  Info,
  Send,
  Mic,
  Smile,
  ArrowUp,
  Check,
  Bell,
  CheckCheck,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Key,
} from 'lucide-react';
import {
  getTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  fetchTelegramReplies,
  testTelegramConnection,
  TelegramConfig,
} from '../services/telegram';
import { useDevice } from '../hooks/useDevice';

export interface MessageItem {
  id: string;
  sender: 'me' | 'jongjin';
  text: string;
  timestamp: string;
  status?: 'sending' | 'delivered' | 'read';
}

export interface MessagesAppProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
  dragControls?: any;
  onFocus?: () => void;
}

// Web Audio API를 이용한 정교한 macOS iMessage 효과음 합성
const playSound = (type: 'send' | 'receive') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'send') {
      // iMessage 전송 swoosh 사운드 (주파수 스윕)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else {
      // iMessage 수신 딩동 사운드 (영롱한 2중 화음)
      const now = ctx.currentTime;
      [880, 1320].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.16, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    }
  } catch (e) {
    // 오디오 미지원 환경 무시
  }
};

export const MessagesApp: React.FC<MessagesAppProps> = ({
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
  dragControls,
  onFocus,
}) => {
  // 현재 시간 포맷팅 (예: "오후 10:35")
  const formatTime = (d: Date = new Date()) => {
    const hour = d.getHours();
    const minute = d.getMinutes().toString().padStart(2, '0');
    const ampm = hour >= 12 ? '오후' : '오전';
    const formattedHour = hour % 12 || 12;
    return `${ampm} ${formattedHour}:${minute}`;
  };

  // 대화 메시지 기록 상태
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome-1',
      sender: 'jongjin',
      text: '안녕하세요! 오종진의 포트폴리오에 오신 것을 환영합니다. 👋',
      timestamp: formatTime(new Date(Date.now() - 1000 * 60 * 3)),
      status: 'read',
    },
    {
      id: 'welcome-2',
      sender: 'jongjin',
      text: 'C++, Python 소프트웨어 개발이나 협업에 대해 궁금한 점이 있으시다면 편하게 메시지를 남겨주세요!',
      timestamp: formatTime(new Date(Date.now() - 1000 * 60 * 2)),
      status: 'read',
    },
    {
      id: 'welcome-3',
      sender: 'jongjin',
      text: '여기에 메시지를 입력하시면 제 텔레그램으로 즉시 알림이 전달되며, 제가 텔레그램으로 답장하면 이 화면에 실시간으로 표시됩니다. 😊',
      timestamp: formatTime(new Date(Date.now() - 1000 * 60 * 1)),
      status: 'read',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // 텔레그램 설정 상태
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(getTelegramConfig);
  const [tempBotToken, setTempBotToken] = useState(telegramConfig.botToken);
  const [tempChatId, setTempChatId] = useState(telegramConfig.chatId);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message: string; success?: boolean } | null>(null);

  const { isMobile } = useDevice();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUpdateIdRef = useRef<number>(0);
  const isComposingRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 스크롤 자동 이동 (window 전체 스크롤을 유발하는 scrollIntoView 대신 컨테이너의 scrollTop 직접 제어)
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 텔레그램 봇 실시간 답장 폴링 (3초마다 체크)
  useEffect(() => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) return;

    const interval = setInterval(async () => {
      const { updates, newLastUpdateId } = await fetchTelegramReplies(lastUpdateIdRef.current);
      if (newLastUpdateId > lastUpdateIdRef.current) {
        lastUpdateIdRef.current = newLastUpdateId;
      }

      if (updates.length > 0) {
        playSound('receive');
        setMessages((prev) => [
          ...prev,
          ...updates.map((u) => ({
            id: `tg-${u.updateId}`,
            sender: 'jongjin' as const,
            text: u.text,
            timestamp: formatTime(new Date(u.date * 1000)),
            status: 'read' as const,
          })),
        ]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [telegramConfig]);

  // 메시지 전송 처리 (한글 IME 조합 중복 방지)
  const handleSendMessage = async () => {
    if (isComposingRef.current) return;

    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: trimmed,
      timestamp: formatTime(),
      status: 'delivered',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    playSound('send');

    // 1. 텔레그램 설정이 되어 있으면 실제 텔레그램으로 발송
    if (telegramConfig.botToken && telegramConfig.chatId) {
      sendTelegramMessage(trimmed).catch((err) => {
        console.error('Telegram notification error:', err);
      });
    } else {
      // 2. 텔레그램 설정이 아직 안 되어 있을 때, UI 테스트를 위해 1.5초 후 친절한 가이드 자동 응답 시뮬레이션
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        playSound('receive');
        setMessages((prev) => [
          ...prev,
          {
            id: `auto-reply-${Date.now()}`,
            sender: 'jongjin',
            text: '소중한 메시지 감사합니다! 현재 텔레그램 연동이 설정되지 않아 모의 안내로 응답되었습니다. 상단 (i) 정보 버튼을 눌러 텔레그램 봇 토큰과 Chat ID를 등록하시면 종진님의 스마트폰 텔레그램으로 즉시 알림이 전송됩니다. 📱',
            timestamp: formatTime(),
            status: 'read',
          },
        ]);
      }, 1500);
    }
  };

  // 텔레그램 설정 저장
  const handleSaveTelegramConfig = () => {
    const updated: TelegramConfig = {
      botToken: tempBotToken.trim(),
      chatId: tempChatId.trim(),
      isEnabled: Boolean(tempBotToken.trim() && tempChatId.trim()),
    };
    saveTelegramConfig(updated);
    setTelegramConfig(updated);
    setIsInfoOpen(false);
    setTestStatus(null);
  };

  // 텔레그램 연동 테스트 실행
  const handleRunTest = async () => {
    if (!tempBotToken.trim() || !tempChatId.trim()) {
      setTestStatus({
        loading: false,
        success: false,
        message: 'Bot Token과 Chat ID를 모두 입력해 주세요.',
      });
      return;
    }

    setTestStatus({ loading: true, message: '텔레그램 봇 연결 및 메시지 발송 중...' });
    const res = await testTelegramConnection(tempBotToken.trim(), tempChatId.trim());

    if (res.success) {
      setTestStatus({
        loading: false,
        success: true,
        message: `성공! @${res.botName} 봇에서 텔레그램 알림을 확인하세요.`,
      });
    } else {
      setTestStatus({
        loading: false,
        success: false,
        message: res.error || '연동 실패',
      });
    }
  };

  const latestMessage = messages[messages.length - 1];

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#1e1e20] text-[#e0e0e0] font-sans select-none overflow-hidden text-[13px] ${
        isMaximized ? 'rounded-none' : 'rounded-[18px]'
      }`}
      onClick={() => onFocus?.()}
    >
      {/* ======================= 전체 창 그리드 (좌측 사이드바 + 우측 채팅) ======================= */}
      <div className="flex flex-1 overflow-hidden h-full">
        {/* ======================= 좌측 사이드바 (데스크톱에서만 노출, 모바일은 1인 전용이므로 풀화면 채팅) ======================= */}
        <div
          className={`hidden md:flex w-[260px] sm:w-[280px] flex-shrink-0 bg-[#1a1a1c] border-r border-[#2d2d30] flex-col h-full select-none ${
            isMaximized ? 'rounded-none' : 'rounded-l-[18px]'
          }`}
        >
          {/* 상단 툴바: 신호등 + 검색 + 새 메시지 */}
          <div
            onPointerDown={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('button') || target.closest('input')) return;
              onFocus?.();
              dragControls?.start(e);
            }}
            onDoubleClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.closest('button') || target.closest('input')) return;
              onMaximize?.();
            }}
            className="h-12 bg-[#1a1a1c] border-b border-[#2d2d30] flex items-center justify-between px-3.5 flex-shrink-0 cursor-grab active:cursor-grabbing"
          >
            {/* macOS 신호등 (Red, Yellow, Green) 버튼 */}
            <div
              className="flex items-center space-x-2"
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.();
                }}
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
                title="전체화면"
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center hover:opacity-90 cursor-default"
              >
                <Maximize2 className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
              </button>
            </div>

            {/* 새 메시지 작성 버튼 */}
            <button
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
              title="새로운 메시지"
              className="p-1.5 rounded-lg hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-default"
            >
              <SquarePen className="w-4 h-4" />
            </button>
          </div>

          {/* 검색창 */}
          <div className="p-2.5 border-b border-[#2d2d30]/50">
            <div className="flex items-center bg-[#252528] rounded-lg px-2.5 py-1.5 border border-white/5">
              <Search className="w-3.5 h-3.5 text-neutral-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색"
                className="bg-transparent text-xs text-white outline-none w-full placeholder:text-neutral-500"
              />
            </div>
          </div>

          {/* 대화 상대 목록 */}
          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            <div className="p-2.5 rounded-xl bg-[#007AFF] text-white shadow-md flex items-center gap-3 cursor-pointer transition-all">
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow border border-white/20">
                  종진
                </div>
                {telegramConfig.isEnabled && (
                  <div
                    title="텔레그램 알림 연동 중"
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#1a1a1c]"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs tracking-tight text-white">오종진</span>
                  <span className="text-[10px] text-white/80">
                    {latestMessage?.timestamp || '방금'}
                  </span>
                </div>
                <div className="text-[11px] text-white/90 truncate mt-0.5 font-normal">
                  {latestMessage ? latestMessage.text : '메시지를 입력해 보세요...'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================= 우측 메인 채팅 영역 (모바일에서는 전체 100% 폭 활용) ======================= */}
        <div
          className={`flex-1 flex flex-col h-full bg-[#161618] relative w-full ${
            isMaximized || isMobile ? 'rounded-none' : 'rounded-r-[18px]'
          }`}
        >
          {/* 상단 대화 상대 헤더 */}
          <div
            onPointerDown={(e) => {
              if (isMobile) return;
              const target = e.target as HTMLElement;
              if (target.closest('button')) return;
              onFocus?.();
              dragControls?.start(e);
            }}
            onDoubleClick={(e) => {
              if (isMobile) return;
              const target = e.target as HTMLElement;
              if (target.closest('button')) return;
              onMaximize?.();
            }}
            className="h-12 bg-[#1f1f22] border-b border-[#2d2d30] flex items-center justify-between px-3.5 sm:px-4 flex-shrink-0 select-none"
          >
            {/* 좌측: 모바일일 때는 신호등 버튼 배치 + 상대 프로필 */}
            <div className="flex items-center gap-2.5">
              {isMobile && (
                <div
                  className="flex items-center space-x-2 mr-1"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                    }}
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
                    title="전체화면"
                    className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center hover:opacity-90 cursor-default"
                  >
                    <Maximize2 className="w-2 h-2 text-black/60 opacity-0 hover:opacity-100" />
                  </button>
                </div>
              )}

              {/* 상대 정보 */}
              <div className="flex items-center gap-2 pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-[10px] shadow">
                  종진
                </div>
                <span className="font-semibold text-xs text-white">오종진</span>
                <span className="text-[10px] text-[#007AFF] font-medium bg-[#007AFF]/10 px-1.5 py-0.5 rounded-full border border-[#007AFF]/20">
                  iMessage
                </span>
              </div>
            </div>

            {/* 우측 액션 도구: 영상 통화 / 오디오 통화 / 정보(i) */}
            <div
              className="flex items-center gap-1.5 text-neutral-400"
              onPointerDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => alert('FaceTime 영상 통화는 macOS 실제 기기 연결 시 지원됩니다.')}
                title="FaceTime 영상 통화"
                className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-default"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert('오디오 통화는 macOS 실제 기기 연결 시 지원됩니다.')}
                title="오디오 통화"
                className="hidden sm:flex p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-default"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsInfoOpen((prev) => !prev)}
                title="상세 정보 및 텔레그램 연동 설정"
                className={`p-1.5 rounded-lg transition-colors cursor-default ${
                  isInfoOpen || !telegramConfig.isEnabled
                    ? 'bg-[#007AFF]/20 text-[#007AFF]'
                    : 'hover:bg-white/10 hover:text-white'
                }`}
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 텔레그램 미연동 시 안내 배너 */}
          {!telegramConfig.isEnabled && (
            <div className="bg-[#007AFF]/10 border-b border-[#007AFF]/20 px-4 py-2 flex items-center justify-between text-xs text-[#64D2FF]">
              <div className="flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  텔레그램 봇을 연동하시면 사용자가 보낸 문자가 스마트폰으로 즉시 전송됩니다.
                </span>
              </div>
              <button
                onClick={() => setIsInfoOpen(true)}
                className="px-2 py-0.5 rounded bg-[#007AFF] hover:bg-[#0062cc] text-white text-[11px] font-semibold transition-colors shadow-sm ml-2"
              >
                연동 설정하기
              </button>
            </div>
          )}

          {/* ======================= 메시지 스크롤 영역 ======================= */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar select-text">
            {/* 날짜 배너 */}
            <div className="flex flex-col items-center justify-center my-2 text-center">
              <span className="text-[11px] font-medium text-[#8e8e93]">
                오늘 {formatTime()}
              </span>
              <span className="text-[10px] text-[#007AFF] mt-0.5 font-medium tracking-wide">
                iMessage (텔레그램 실시간 연동)
              </span>
            </div>

            {/* 메시지 말풍선 리스트 */}
            {messages.map((msg) => {
              const isMe = msg.sender === 'me';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5`}
                >
                  <div
                    className={`px-3.5 py-2 max-w-[75%] rounded-2xl text-[13px] leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                      isMe
                        ? 'bg-[#007AFF] text-white rounded-br-sm'
                        : 'bg-[#2c2c2e] text-neutral-100 rounded-bl-sm border border-white/5'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* 보낸 시간 및 전송 상태 (macOS 순정 "전송됨" 표시) */}
                  <div
                    className={`flex items-center gap-1 text-[10px] text-[#8e8e93] px-1 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {isMe && (
                      <span className="text-[#8e8e93] font-medium">· 전송됨</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 상대방 입력 중 애니메이션 인디케이터 */}
            {isTyping && (
              <div className="flex items-center space-x-1.5 bg-[#2c2c2e] text-neutral-400 px-3.5 py-2.5 rounded-2xl rounded-bl-sm w-16 border border-white/5">
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ======================= 하단 입력창 (macOS iMessage 스타일) ======================= */}
          <div className="p-3 bg-[#1a1a1c] border-t border-[#2d2d30] flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center bg-[#252528] rounded-full border border-white/10 px-3.5 py-1.5 focus-within:border-[#007AFF]/60 focus-within:ring-1 focus-within:ring-[#007AFF]/30 transition-all"
            >
              {/* 스마일 / 이모지 버튼 */}
              <button
                type="button"
                title="이모티콘"
                className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-default mr-1.5"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* 텍스트 입력 필드 (한글 IME 조합 중복 전송 방지 완벽 처리) */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={() => {
                  isComposingRef.current = false;
                }}
                onKeyDown={(e) => {
                  // 한글 IME 조합 중일 때 Enter 누르면 중복 전송 방지
                  if (e.nativeEvent.isComposing || isComposingRef.current || e.keyCode === 229) {
                    return;
                  }
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="iMessage"
                className="bg-transparent text-xs text-white outline-none w-full placeholder:text-neutral-500 py-1"
                style={{ caretColor: '#007AFF' }}
              />

              {/* 전송 버튼 (텍스트가 있을 때는 파란색 위쪽 화살표 버튼, 비어있을 때는 마이크) */}
              {inputText.trim() ? (
                <button
                  type="submit"
                  title="전송 (Enter)"
                  className="w-6 h-6 rounded-full bg-[#007AFF] hover:bg-[#0062cc] text-white flex items-center justify-center transition-transform active:scale-95 shadow cursor-default flex-shrink-0 ml-1.5"
                >
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              ) : (
                <button
                  type="button"
                  title="음성 메시지"
                  className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-default flex-shrink-0 ml-1.5"
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {/* ======================= 상세 정보 & 텔레그램 연동 모달 (i 버튼) ======================= */}
          {isInfoOpen && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
              <div className="bg-[#242426] border border-white/15 rounded-2xl w-full max-w-md p-5 shadow-2xl text-[12px] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0088cc] flex items-center justify-center text-white">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-white">텔레그램 알림 연동</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsInfoOpen(false);
                      setTestStatus(null);
                    }}
                    className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <p className="text-neutral-300 leading-relaxed text-[11px]">
                    포트폴리오에 접속한 방문자가 메시지를 보내면, 종진님의 텔레그램 계정으로 실시간 알림이 발송되고 텔레그램에서 보낸 답장이 이 창에 실시간으로 표시됩니다.
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        1. Telegram Bot Token
                      </label>
                      <input
                        type="text"
                        value={tempBotToken}
                        onChange={(e) => setTempBotToken(e.target.value)}
                        placeholder="예: 123456789:ABCdefGHIjklMNOpqrs..."
                        className="w-full bg-[#18181a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#007AFF]"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        텔레그램 @BotFather 에게 /newbot 을 입력하여 생성된 토큰
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                        2. Telegram Chat ID (본인 숫자 ID)
                      </label>
                      <input
                        type="text"
                        value={tempChatId}
                        onChange={(e) => setTempChatId(e.target.value)}
                        placeholder="예: 123456789"
                        className="w-full bg-[#18181a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#007AFF]"
                      />
                      <span className="text-[10px] text-neutral-400 mt-0.5 block">
                        텔레그램 @userinfobot 에게 메시지를 보내면 확인 가능한 본인의 숫자 ID
                      </span>
                    </div>
                  </div>

                  {/* 테스트 상태 메시지 */}
                  {testStatus && (
                    <div
                      className={`p-2.5 rounded-lg text-[11px] leading-snug flex items-center gap-2 ${
                        testStatus.success
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : testStatus.loading
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <span>{testStatus.message}</span>
                    </div>
                  )}

                  {/* 터미널 테스트 안내 */}
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-neutral-400 space-y-1">
                    <div className="font-semibold text-neutral-300">💡 터미널 테스트 스크립트:</div>
                    <code className="text-amber-400 block font-mono">
                      python3 scripts/test_telegram.py
                    </code>
                    <span>또는 npm run test:telegram 으로 터미널에서도 검증 가능합니다.</span>
                  </div>
                </div>

                {/* 버튼들 */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <button
                    onClick={handleRunTest}
                    disabled={testStatus?.loading}
                    className="px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3 h-3" />
                    <span>연동 테스트 발송</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsInfoOpen(false)}
                      className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-neutral-300 text-xs transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleSaveTelegramConfig}
                      className="px-3.5 py-1.5 rounded-lg bg-[#007AFF] hover:bg-[#0062cc] text-white text-xs font-semibold transition-colors shadow"
                    >
                      설정 저장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

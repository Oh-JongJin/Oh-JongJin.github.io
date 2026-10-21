import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Wifi,
  Bluetooth,
  Globe,
  Shield,
  Battery,
  Settings as SettingsIcon,
  Monitor,
  Sliders,
  Sparkles,
  Sun,
  Moon,
  Laptop,
  HardDrive,
  RefreshCw,
  Share2,
  Calendar,
  List,
  Radio,
  Eye,
  Check,
} from 'lucide-react';
import { useDevice } from '../hooks/useDevice';

interface SettingsAppProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isManualOverride: boolean;
  onResetAutoMode: () => void;
  batteryPercent: number;
  isCharging: boolean;
  airpodsPercent: number;
  mousePercent: number;
}

export const SettingsApp: React.FC<SettingsAppProps> = ({
  isDarkMode,
  onToggleDarkMode,
  isManualOverride,
  onResetAutoMode,
  batteryPercent,
  isCharging,
  airpodsPercent,
  mousePercent,
}) => {
  // 현재 선택된 사이드바 메뉴 (기본값: 'general' - 스크린샷과 동일)
  const [selectedMenu, setSelectedMenu] = useState<string>('general');
  // '일반' 탭 내부의 서브페이지 ('main' | 'about' | 'update' | 'storage')
  const [generalSubpage, setGeneralSubpage] = useState<string>('main');

  const { isMobile } = useDevice();
  const [mobileView, setMobileView] = useState<'menu' | 'detail'>('menu');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectMenu = (menu: string) => {
    setSelectedMenu(menu);
    setGeneralSubpage('main');
    if (isMobile) {
      setMobileView('detail');
    }
  };

  return (
    <div className="flex h-full w-full bg-[#161618] text-[#e0e0e0] font-sans select-none overflow-hidden text-[13px]">
      {/* ===================== 왼쪽 사이드바 (스크린샷 100% 재현, 모바일 반응형) ===================== */}
      <div
        className={`${
          isMobile && mobileView !== 'menu' ? 'hidden' : 'flex'
        } ${isMobile ? 'w-full' : 'w-[240px] flex-shrink-0'} bg-[#1c1c1e]/95 backdrop-blur-2xl border-r border-white/10 flex-col h-full`}
      >
        {/* 상단 검색창 */}
        <div className="pt-2 px-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 pl-8 pr-3 bg-[#2c2c2e] hover:bg-[#323235] focus:bg-[#323235] text-white text-xs rounded-lg outline-none transition-colors placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* 사이드바 메뉴 리스트 */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4 no-scrollbar">
          {/* 1. 사용자 프로필 영역 (기린 아바타) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
              {/* 기린 아바타 원형 */}
              <div className="w-10 h-10 rounded-full bg-[#FFE082] flex items-center justify-center text-2xl shadow-inner flex-shrink-0 overflow-hidden border border-white/20">
                🦒
              </div>
              <div className="truncate">
                <div className="font-semibold text-white text-xs leading-snug">오종진</div>
                <div className="text-[11px] text-neutral-400">Apple 계정</div>
              </div>
            </div>

            {/* 가족 아이템 */}
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <div className="flex -space-x-1.5 items-center">
                <div className="w-5 h-5 rounded-full bg-[#FFE082] flex items-center justify-center text-[11px] border border-neutral-800">🦒</div>
                <div className="w-5 h-5 rounded-full bg-[#E1BEE7] flex items-center justify-center text-[11px] border border-neutral-800">🐹</div>
              </div>
              <span className="text-xs text-neutral-200">가족</span>
            </div>
          </div>

          {/* 2. 네트워크 및 연결 그룹 */}
          <div className="space-y-0.5 pt-1 border-t border-white/5">
            <button
              onClick={() => handleSelectMenu('wifi')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'wifi' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Wifi className="w-3.5 h-3.5" />
              </div>
              <span>Wi-Fi</span>
            </button>

            <button
              onClick={() => handleSelectMenu('bluetooth')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'bluetooth' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Bluetooth className="w-3.5 h-3.5" />
              </div>
              <span>Bluetooth</span>
            </button>

            <button
              onClick={() => handleSelectMenu('network')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'network' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <span>네트워크</span>
            </button>

            <button
              onClick={() => handleSelectMenu('vpn')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'vpn' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span>VPN</span>
            </button>

            <button
              onClick={() => handleSelectMenu('battery')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'battery' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#30D158] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Battery className="w-3.5 h-3.5 fill-current" />
              </div>
              <span>배터리</span>
            </button>
          </div>

          {/* 3. 시스템 및 일반 설정 그룹 */}
          <div className="space-y-0.5 pt-1 border-t border-white/5">
            {/* 일반 (기본 활성 선택 상태) */}
            <button
              onClick={() => handleSelectMenu('general')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'general' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#8E8E93] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <SettingsIcon className="w-3.5 h-3.5" />
              </div>
              <span>일반</span>
            </button>

            <button
              onClick={() => handleSelectMenu('desktop')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'desktop' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <span>데스크탑 및 Dock</span>
            </button>

            <button
              onClick={() => handleSelectMenu('display')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'display' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sun className="w-3.5 h-3.5" />
              </div>
              <span>디스플레이</span>
            </button>

            <button
              onClick={() => handleSelectMenu('menubar')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'menubar' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#8E8E93] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span>메뉴 막대</span>
            </button>

            <button
              onClick={() => handleSelectMenu('wallpaper')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'wallpaper' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#32ADE6] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <span className="text-xs">🌸</span>
              </div>
              <span>배경화면</span>
            </button>

            <button
              onClick={() => handleSelectMenu('accessibility')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'accessibility' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#0A84FF] flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Eye className="w-3.5 h-3.5" />
              </div>
              <span>손쉬운 사용</span>
            </button>

            {/* 화면 모드 (다크/라이트 전환 연동) */}
            <button
              onClick={() => handleSelectMenu('appearance')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'appearance' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-[#2C2C2E] border border-white/10 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Moon className="w-3 h-3 text-amber-300" />
              </div>
              <span>화면 모드</span>
            </button>

            <button
              onClick={() => handleSelectMenu('apple_intelligence')}
              className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedMenu === 'apple_intelligence' ? 'bg-[#007AFF] text-white' : 'hover:bg-white/5 text-neutral-200'
              }`}
            >
              <div className="w-5 h-5 rounded-[5px] bg-gradient-to-tr from-rose-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="truncate">Apple Intelligence 및...</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================== 오른쪽 메인 패널 (모바일 반응형 지원) ===================== */}
      <div
        className={`${
          isMobile && mobileView !== 'detail' ? 'hidden' : 'flex'
        } flex-1 flex-col h-full bg-[#161618] overflow-hidden`}
      >
        {/* 상단 네비게이션 바 (< > 버튼 또는 모바일 뒤로가기) */}
        <div className="h-10 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-[#161618]/50 flex-shrink-0">
          {isMobile ? (
            <button
              onClick={() => setMobileView('menu')}
              className="flex items-center gap-1 text-[#007AFF] font-medium text-xs py-1 hover:opacity-80 transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>설정 목록</span>
            </button>
          ) : (
            <div className="flex items-center rounded-md border border-white/10 bg-[#28282a]/60 p-0.5">
              <button
                onClick={() => setGeneralSubpage('main')}
                disabled={generalSubpage === 'main'}
                className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-400 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="w-[1px] h-3 bg-white/10" />
              <button
                disabled
                className="p-1 rounded text-neutral-400 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 메인 스크롤 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* ================= 1. '일반' 탭 (스크린샷 상태와 100% 동일) ================= */}
          {selectedMenu === 'general' && generalSubpage === 'main' && (
            <div className="max-w-2xl mx-auto space-y-4">
              {/* 상단 일반 헤더 카드 */}
              <div className="bg-[#28282a] rounded-2xl p-6 text-center shadow-lg border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#606064] to-[#48484a] border border-white/20 mx-auto flex items-center justify-center shadow-md">
                  <SettingsIcon className="w-9 h-9 text-white drop-shadow" />
                </div>
                <h1 className="text-xl font-bold text-white mt-3 tracking-tight">일반</h1>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  소프트웨어 업데이트, 기기 언어, AirDrop 등 Mac에서 사용할 전반적인 설정 및 선호 사항을 관리합니다.
                </p>
              </div>

              {/* 하단 옵션 그룹 1: 정보, 소프트웨어 업데이트, 저장 공간 */}
              <div className="bg-[#28282a] rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 shadow-sm">
                <button
                  onClick={() => setGeneralSubpage('about')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5C5C60] flex items-center justify-center text-white">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">정보</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                <button
                  onClick={() => setGeneralSubpage('update')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5C5C60] flex items-center justify-center text-white">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">소프트웨어 업데이트</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>

                <button
                  onClick={() => setGeneralSubpage('storage')}
                  className="w-full flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5C5C60] flex items-center justify-center text-white">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">저장 공간</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* 하단 옵션 그룹 2: AppleCare 및 보증 */}
              <div className="bg-[#28282a] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-red-500 shadow-sm">
                      <span className="text-base font-bold"></span>
                    </div>
                    <span className="text-xs font-medium text-white">AppleCare 및 보증</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>

              {/* 하단 옵션 그룹 3: AirDrop 및 연속성 */}
              <div className="bg-[#28282a] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0A84FF] flex items-center justify-center text-white shadow-sm">
                      <Radio className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">AirDrop 및 연속성</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>

              {/* 하단 옵션 그룹 4: 공유 */}
              <div className="bg-[#28282a] rounded-xl overflow-hidden border border-white/5 shadow-sm">
                <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#8E8E93] flex items-center justify-center text-white shadow-sm">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">공유</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>

              {/* 하단 옵션 그룹 5: 날짜 및 시간, 로그인 항목 */}
              <div className="bg-[#28282a] rounded-xl overflow-hidden border border-white/5 divide-y divide-white/5 shadow-sm">
                <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0A84FF] flex items-center justify-center text-white shadow-sm">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">날짜 및 시간</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>

                <div className="flex items-center justify-between p-3.5 hover:bg-white/5 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#5C5C60] flex items-center justify-center text-white shadow-sm">
                      <List className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-white">로그인 항목 및 확장 프로그램</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. '일반 > 정보' 서브페이지 ================= */}
          {selectedMenu === 'general' && generalSubpage === 'about' && (
            <div className="max-w-xl mx-auto space-y-5 py-2">
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/20 mx-auto flex items-center justify-center shadow-2xl">
                  <span className="text-4xl text-white"></span>
                </div>
                <h2 className="text-xl font-bold text-white mt-3">JongJin's MacBook Pro</h2>
                <p className="text-xs text-neutral-400">14형, 2024년 모델</p>
              </div>

              <div className="bg-[#28282a] rounded-xl border border-white/5 divide-y divide-white/5 text-xs">
                <div className="flex justify-between p-3">
                  <span className="text-neutral-400">칩</span>
                  <span className="text-white font-medium">Apple M3 Pro</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-neutral-400">메모리</span>
                  <span className="text-white font-medium">18 GB</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-neutral-400">일련 번호</span>
                  <span className="text-white font-medium">5JX2-OH-MACOS</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-neutral-400">macOS 버전</span>
                  <span className="text-white font-medium">Sonoma 14.5 (23F79)</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. '화면 모드 / 디스플레이' 탭 ================= */}
          {(selectedMenu === 'appearance' || selectedMenu === 'display') && (
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">화면 모드 (외형)</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Mac의 버튼, 메뉴 및 윈도우 모양을 변경합니다.
                </p>
              </div>

              {/* 라이트 / 다크 선택 카드 */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (isDarkMode) onToggleDarkMode();
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    !isDarkMode
                      ? 'border-[#007AFF] bg-[#28282a] shadow-lg ring-1 ring-[#007AFF]'
                      : 'border-white/10 bg-[#28282a] hover:bg-[#323235]'
                  }`}
                >
                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-sky-200 via-indigo-100 to-amber-100 border border-white/20 p-2 flex flex-col justify-between shadow-inner">
                    <div className="w-12 h-2.5 rounded bg-blue-500/80" />
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-white">라이트</span>
                    {!isDarkMode && <Check className="w-3.5 h-3.5 text-[#007AFF]" />}
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (!isDarkMode) onToggleDarkMode();
                  }}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    isDarkMode
                      ? 'border-[#007AFF] bg-[#28282a] shadow-lg ring-1 ring-[#007AFF]'
                      : 'border-white/10 bg-[#28282a] hover:bg-[#323235]'
                  }`}
                >
                  <div className="w-full h-20 rounded-lg bg-gradient-to-br from-neutral-950 via-slate-900 to-indigo-950 border border-white/20 p-2 flex flex-col justify-between shadow-inner">
                    <div className="w-12 h-2.5 rounded bg-blue-600/80" />
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-xs font-medium text-white">다크</span>
                    {isDarkMode && <Check className="w-3.5 h-3.5 text-[#007AFF]" />}
                  </div>
                </button>
              </div>

              {/* 시간대별 자동 전환 복원 */}
              <div className="p-4 rounded-xl bg-[#28282a] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    시간대별 자동 배경화면 전환
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    오후 6시에는 다크 모드, 오전 6시에는 라이트 모드로 자동 변경됩니다.
                  </div>
                </div>

                {isManualOverride ? (
                  <button
                    onClick={onResetAutoMode}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#007AFF] hover:bg-[#0066d6] text-white transition-colors shadow"
                  >
                    자동으로 재설정
                  </button>
                ) : (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 자동 실행 중
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ================= 4. '배터리' 탭 ================= */}
          {selectedMenu === 'battery' && (
            <div className="max-w-xl mx-auto space-y-4">
              <div>
                <h2 className="text-base font-semibold text-white">배터리</h2>
                <p className="text-xs text-neutral-400 mt-1">
                  기기 및 연결된 액세서리의 전원 상태입니다.
                </p>
              </div>

              <div className="bg-[#28282a] rounded-xl border border-white/5 divide-y divide-white/5 text-xs">
                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#30D158] flex items-center justify-center text-white">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">MacBook Pro</div>
                      <div className="text-[11px] text-neutral-400">
                        {isCharging ? '충전 중' : '배터리 전원 사용'}
                      </div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-400">{batteryPercent}%</span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0A84FF] flex items-center justify-center text-white">
                      <span className="text-sm">🎧</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">AirPods Pro</div>
                      <div className="text-[11px] text-neutral-400">Bluetooth 연결됨</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-400">{airpodsPercent}%</span>
                </div>

                <div className="flex items-center justify-between p-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#0A84FF] flex items-center justify-center text-white">
                      <span className="text-sm">🖱️</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Magic Mouse</div>
                      <div className="text-[11px] text-neutral-400">Bluetooth 연결됨</div>
                    </div>
                  </div>
                  <span className="text-base font-bold text-emerald-400">{mousePercent}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. 기타 탭 플레이스홀더 ================= */}
          {!['general', 'appearance', 'display', 'battery'].includes(selectedMenu) && (
            <div className="max-w-xl mx-auto py-12 text-center text-neutral-400 space-y-2">
              <div className="text-3xl">⚙️</div>
              <div className="text-sm font-semibold text-white capitalize">{selectedMenu} 설정</div>
              <p className="text-xs">현재 macOS 포트폴리오 웹 시뮬레이션에서 준비 중인 항목입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

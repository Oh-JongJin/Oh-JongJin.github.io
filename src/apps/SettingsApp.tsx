import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Image as ImageIcon,
  Battery,
  Info,
  Check,
  Sparkles,
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'appearance' | 'battery' | 'about'>('appearance');

  return (
    <div className="flex h-full text-white/90 select-none">
      {/* 좌측 사이드바 */}
      <div className="w-52 sm:w-60 bg-black/25 backdrop-blur-xl border-r border-white/10 p-3 flex flex-col justify-between">
        <div className="space-y-4">
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-base shadow">
              JJ
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">오종진</div>
              <div className="text-[10px] text-neutral-400 truncate">Apple 계정</div>
            </div>
          </div>

          {/* 설정 메뉴 카테고리 */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'appearance'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
            >
              <Monitor className="w-4 h-4 text-blue-300" />
              외형 및 디스플레이
            </button>

            <button
              onClick={() => setActiveTab('battery')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'battery'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
            >
              <Battery className="w-4 h-4 text-emerald-400" />
              배터리 & 전원
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-neutral-300 hover:bg-white/10'
              }`}
            >
              <Info className="w-4 h-4 text-purple-400" />
              이 Mac에 관하여
            </button>
          </div>
        </div>

        <div className="text-[10px] text-neutral-500 px-2 py-1">
          macOS Web OS v1.2.0
        </div>
      </div>

      {/* 우측 메인 콘텐츠 패널 */}
      <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/40">
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-base font-semibold text-white">외형 (테마)</h2>
              <p className="text-xs text-neutral-400 mt-1">
                화면 모드 및 시간대별 동적 배경화면 동작을 설정합니다.
              </p>
            </div>

            {/* 라이트 / 다크 선택 카드 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 라이트 카드 */}
              <button
                onClick={() => {
                  if (isDarkMode) onToggleDarkMode();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                  !isDarkMode
                    ? 'border-blue-500 bg-white/10 shadow-lg ring-1 ring-blue-500'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
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
                  <span className="text-xs font-medium text-white">라이트 모드</span>
                  {!isDarkMode && <Check className="w-3 h-3 text-blue-400" />}
                </div>
              </button>

              {/* 다크 카드 */}
              <button
                onClick={() => {
                  if (!isDarkMode) onToggleDarkMode();
                }}
                className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                  isDarkMode
                    ? 'border-blue-500 bg-white/10 shadow-lg ring-1 ring-blue-500'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
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
                  <span className="text-xs font-medium text-white">다크 모드</span>
                  {isDarkMode && <Check className="w-3 h-3 text-blue-400" />}
                </div>
              </button>
            </div>

            {/* 시간대별 자동 전환 복원 옵션 */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
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
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow"
                >
                  자동 모드로 재설정
                </button>
              ) : (
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 자동 실행 중
                </span>
              )}
            </div>
          </div>
        )}

        {activeTab === 'battery' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h2 className="text-base font-semibold text-white">배터리 상태</h2>
              <p className="text-xs text-neutral-400 mt-1">
                연결된 기기들의 실시간 전원 상태와 잔량을 확인합니다.
              </p>
            </div>

            <div className="space-y-3">
              {/* 맥북 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">MacBook Pro</div>
                    <div className="text-[11px] text-neutral-400">
                      {isCharging ? '전원 어댑터 연결됨 (충전 중)' : '배터리 전원 사용 중'}
                    </div>
                  </div>
                </div>
                <div className="text-base font-bold text-emerald-400">{batteryPercent}%</div>
              </div>

              {/* 에어팟 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white">🎧</div>
                  <div>
                    <div className="text-xs font-semibold text-white">AirPods Pro</div>
                    <div className="text-[11px] text-neutral-400">Bluetooth 연결됨</div>
                  </div>
                </div>
                <div className="text-base font-bold text-emerald-400">{airpodsPercent}%</div>
              </div>

              {/* 매직 마우스 */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/10 text-white">🖱️</div>
                  <div>
                    <div className="text-xs font-semibold text-white">Magic Mouse</div>
                    <div className="text-[11px] text-neutral-400">Bluetooth 연결됨</div>
                  </div>
                </div>
                <div className="text-base font-bold text-emerald-400">{mousePercent}%</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6 max-w-xl text-center py-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-900 border border-white/20 mx-auto flex items-center justify-center shadow-2xl">
              <span className="text-4xl"></span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">JongJin's MacBook Pro</h2>
              <p className="text-xs text-neutral-400 mt-1">macOS Sonoma Web Edition</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 max-w-sm mx-auto space-y-2 text-left text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">칩</span>
                <span className="text-white font-medium">Apple M3 Pro</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">메모리</span>
                <span className="text-white font-medium">18 GB</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-neutral-400">일련 번호</span>
                <span className="text-white font-medium">5JX2-OH-MACOS</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-400">macOS</span>
                <span className="text-white font-medium">Sonoma 14.5 (Web)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

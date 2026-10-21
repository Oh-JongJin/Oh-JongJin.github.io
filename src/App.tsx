import React, { useState, useEffect } from 'react';
import wallpaperLight from './assets/wallpaper-light.jpg';
import wallpaperDark from './assets/wallpaper-dark.jpg';
import { useBattery } from './hooks/useBattery';
import { MenuBar } from './components/MenuBar';
import { Desktop } from './components/Desktop';
import { Dock, DockAppItem } from './components/Dock';
import { Window } from './components/Window';
import { BatteryWidget } from './components/BatteryWidget';
import { AboutMeApp } from './apps/AboutMeApp';
import { ProjectsApp } from './apps/ProjectsApp';
import { PhotoApp } from './apps/PhotoApp';
import { TerminalApp } from './apps/TerminalApp';
import { SettingsApp } from './apps/SettingsApp';

// 실제 사용자의 Mac Dock 정품 아이콘들
import finderIcon from './assets/dock/finder.png';
import safariIcon from './assets/dock/safari.png';
import whaleIcon from './assets/dock/whale.png';
import photosIcon from './assets/dock/photos.png';
import musicIcon from './assets/dock/music.png';
import appstoreIcon from './assets/dock/appstore.png';
import terminalIcon from './assets/dock/terminal.png';
import settingsIcon from './assets/dock/settings.png';
import downloadsIcon from './assets/dock/downloads.png';
import trashIcon from './assets/dock/trash.png';

interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  component: React.ReactNode;
  width?: number;
  height?: number;
}

export const App: React.FC = () => {
  const [topZIndex, setTopZIndex] = useState(10);
  const [activeAppTitle, setActiveAppTitle] = useState('Finder');

  // 실제 기기 배터리 API 및 에어팟/마우스 배터리 훅
  const battery = useBattery();

  // 오후 6시(18:00) ~ 익일 오전 6시(05:59): 다크모드
  // 오전 6시(06:00) ~ 오후 6시(17:59): 라이트모드
  const isNightTime = () => {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
  };

  const [isDarkMode, setIsDarkMode] = useState<boolean>(isNightTime);
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // 사용자가 수동으로 버튼을 눌러 모드를 변경했을 때 (수동 고정)
  const handleToggleDarkMode = () => {
    setIsManualOverride(true);
    setIsDarkMode((prev) => !prev);
  };

  // 실제 시간 주기적 체크 (사용자가 수동으로 조작하지 않았을 때만 자동 전환)
  useEffect(() => {
    if (isManualOverride) return;

    const timer = setInterval(() => {
      setIsDarkMode(isNightTime());
    }, 10000);
    return () => clearInterval(timer);
  }, [isManualOverride]);

  const [windows, setWindows] = useState<Record<string, WindowState>>({
    about: {
      id: 'about',
      title: 'Finder — About Me',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      width: 620,
      height: 480,
      component: <AboutMeApp />,
    },
    projects: {
      id: 'projects',
      title: 'Projects',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      width: 720,
      height: 480,
      component: <ProjectsApp />,
    },
    photos: {
      id: 'photos',
      title: 'Photos',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      width: 640,
      height: 420,
      component: <PhotoApp />,
    },
    terminal: {
      id: 'terminal',
      title: 'Terminal — zsh',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      width: 600,
      height: 380,
      component: <TerminalApp />,
    },
    settings: {
      id: 'settings',
      title: '시스템 설정',
      isOpen: false,
      isMinimized: false,
      zIndex: 10,
      width: 700,
      height: 480,
      component: null, // 아래 렌더링 시 최신 상태와 함께 주입
    },
  });

  const focusWindow = (id: string, title?: string) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: nextZ,
      },
    }));
    setActiveAppTitle(title || windows[id]?.title.split(' ')[0] || 'Finder');
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true,
      },
    }));
    setActiveAppTitle('Finder');
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false,
        isMinimized: false,
      },
    }));
    setActiveAppTitle('Finder');
  };

  // 최상단 활성 창 닫기 (Cmd + W, Escape용)
  const closeActiveWindow = () => {
    const activeWins = Object.values(windows).filter((w) => w.isOpen && !w.isMinimized);
    if (activeWins.length === 0) return;

    const topWin = activeWins.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), activeWins[0]);
    if (topWin) {
      closeWindow(topWin.id);
    }
  };

  // 최상단 활성 창 최소화 (Cmd + M용)
  const minimizeActiveWindow = () => {
    const activeWins = Object.values(windows).filter((w) => w.isOpen && !w.isMinimized);
    if (activeWins.length === 0) return;

    const topWin = activeWins.reduce((max, w) => (w.zIndex > max.zIndex ? w : max), activeWins[0]);
    if (topWin) {
      minimizeWindow(topWin.id);
    }
  };

  // macOS 키보드 단축키 시스템
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        closeActiveWindow();
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        minimizeActiveWindow();
      }

      if (e.key === 'Escape') {
        closeActiveWindow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [windows]);

  const toggleDockApp = (id: string) => {
    const target = windows[id];
    if (!target) return;

    if (!target.isOpen) {
      focusWindow(id);
    } else if (target.isMinimized) {
      focusWindow(id);
    } else if (target.zIndex === topZIndex) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  // 사용자가 선택한 정돈된 Dock 앱 목록
  const dockApps: DockAppItem[] = [
    {
      id: 'finder',
      title: 'Finder',
      iconSrc: finderIcon,
      isOpen: windows.about.isOpen,
      onClick: () => toggleDockApp('about'),
    },
    {
      id: 'safari',
      title: 'Safari',
      iconSrc: safariIcon,
      isOpen: false,
      onClick: () => window.open('https://www.apple.com/kr/safari/', '_blank'),
    },
    {
      id: 'whale',
      title: 'NAVER Whale',
      iconSrc: whaleIcon,
      isOpen: false,
      onClick: () => window.open('https://whale.naver.com', '_blank'),
    },
    {
      id: 'photos',
      title: '사진',
      iconSrc: photosIcon,
      isOpen: windows.photos.isOpen,
      onClick: () => toggleDockApp('photos'),
    },
    {
      id: 'music',
      title: 'Apple Music',
      iconSrc: musicIcon,
      isOpen: false,
      onClick: () => window.open('https://music.apple.com/kr/new', '_blank'),
    },
    {
      id: 'appstore',
      title: 'App Store',
      iconSrc: appstoreIcon,
      isOpen: false,
      onClick: () => window.open('https://apps.apple.com/kr', '_blank'),
    },
    {
      id: 'terminal',
      title: '터미널',
      iconSrc: terminalIcon,
      isOpen: windows.terminal.isOpen,
      onClick: () => toggleDockApp('terminal'),
    },
    {
      id: 'settings',
      title: '시스템 설정',
      iconSrc: settingsIcon,
      isOpen: windows.settings.isOpen,
      onClick: () => toggleDockApp('settings'),
    },
    // 구분선 뒤: 다운로드 및 휴지통
    {
      id: 'downloads',
      title: 'Projects',
      iconSrc: downloadsIcon,
      isOpen: windows.projects.isOpen,
      isDividerBefore: true,
      onClick: () => toggleDockApp('projects'),
    },
    {
      id: 'trash',
      title: '휴지통',
      iconSrc: trashIcon,
      isOpen: false,
      onClick: () => setActiveAppTitle('Finder'),
    },
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none bg-black"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setActiveAppTitle('Finder');
        }
      }}
    >
      {/* 라이트 모드 배경화면 레이어 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${wallpaperLight})`,
          opacity: isDarkMode ? 0 : 1,
        }}
      />

      {/* 다크 모드 배경화면 레이어 */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${wallpaperDark})`,
          opacity: isDarkMode ? 1 : 0,
        }}
      />

      {/* 은은한 오버레이로 가독성 확보 */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.25)' : 'rgba(0, 0, 0, 0.08)',
        }}
      />

      {/* 상단 메뉴바 (실제 기기 배터리 및 충전 상태 연동) */}
      <MenuBar
        activeAppTitle={activeAppTitle}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        batteryPercent={battery.macbook}
        isCharging={battery.isCharging}
      />

      {/* 배터리 위젯 (상단바와 동기화 + 에어팟/마우스 랜덤값 + 격자 스냅) */}
      <BatteryWidget
        macbookPercent={battery.macbook}
        isCharging={battery.isCharging}
        airpodsPercent={battery.airpods}
        mousePercent={battery.mouse}
      />

      {/* 바탕화면 아이콘 (모바일 반응형 크기 적용) */}
      <Desktop onOpenApp={(appId) => focusWindow(appId)} />

      {/* 윈도우 창들 */}
      {Object.values(windows).map((win) => {
        // 시스템 설정 창 컴포넌트 실시간 바인딩
        const content =
          win.id === 'settings' ? (
            <SettingsApp
              isDarkMode={isDarkMode}
              onToggleDarkMode={handleToggleDarkMode}
              isManualOverride={isManualOverride}
              onResetAutoMode={() => {
                setIsManualOverride(false);
                setIsDarkMode(isNightTime());
              }}
              batteryPercent={battery.macbook}
              isCharging={battery.isCharging}
              airpodsPercent={battery.airpods}
              mousePercent={battery.mouse}
            />
          ) : (
            win.component
          );

        return (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            isOpen={win.isOpen}
            isMinimized={win.isMinimized}
            zIndex={win.zIndex}
            initialWidth={win.width}
            initialHeight={win.height}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onFocus={() => focusWindow(win.id, win.title)}
          >
            {content}
          </Window>
        );
      })}

      {/* 하단 독 (모바일 반응형 슬림화 & 가로 스크롤 대응) */}
      <Dock apps={dockApps} />
    </div>
  );
};

export default App;

import React, { useState, useRef, useEffect } from 'react';

interface HistoryItem {
  command: string;
  output: React.ReactNode;
}

export const TerminalApp: React.FC = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: 'welcome',
      output: (
        <div className="text-neutral-300">
          <p className="text-emerald-400 font-bold">Welcome to JongJin\'s macOS Web Terminal (v1.0.0)</p>
          <p className="text-xs text-neutral-400 mt-1">
            사용 가능한 명령어를 보려면 <span className="text-amber-300 font-semibold">'help'</span>를 입력하세요.
          </p>
        </div>
      ),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;

    let output: React.ReactNode = '';

    switch (cmd) {
      case 'help':
        output = (
          <div className="space-y-1 text-xs text-neutral-300">
            <p><span className="text-amber-300 font-semibold">whoami</span> - 개발자 소개</p>
            <p><span className="text-amber-300 font-semibold">projects</span> - 프로젝트 목록 출력</p>
            <p><span className="text-amber-300 font-semibold">github</span> - GitHub 프로필 링크 열기</p>
            <p><span className="text-amber-300 font-semibold">clear</span> - 터미널 화면 지우기</p>
            <p><span className="text-amber-300 font-semibold">date</span> - 현재 시각 확인</p>
          </div>
        );
        break;
      case 'whoami':
        output = <p className="text-xs text-neutral-300">오종진 (JongJin Oh) - Frontend & Fullstack Developer</p>;
        break;
      case 'projects':
        output = (
          <div className="space-y-1 text-xs text-neutral-300">
            <p>1. macOS Web Portfolio (React, Tailwind)</p>
            <p>2. Personal Workspace (Streamlit, Python)</p>
            <p>3. Cooking RPG 2D (Game Dev)</p>
          </div>
        );
        break;
      case 'github':
        window.open('https://github.com/Oh-JongJin', '_blank');
        output = <p className="text-xs text-emerald-400">GitHub 프로필을 새 탭에서 열었습니다.</p>;
        break;
      case 'date':
        output = <p className="text-xs text-neutral-300">{new Date().toLocaleString('ko-KR')}</p>;
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      default:
        output = (
          <p className="text-xs text-red-400">
            command not found: {cmd}. ('help'를 입력하여 명령어 목록을 확인하세요)
          </p>
        );
    }

    setHistory((prev) => [...prev, { command: input, output }]);
    setInput('');
  };

  return (
    <div className="p-4 font-mono text-sm h-full flex flex-col bg-neutral-950/90 text-neutral-200">
      <div className="flex-1 overflow-y-auto space-y-3">
        {history.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-semibold">guest@jongjin-mac</span>
              <span className="text-neutral-500">:</span>
              <span className="text-blue-400 font-semibold">~</span>
              <span className="text-neutral-500">$</span>
              <span className="text-white">{item.command}</span>
            </div>
            <div className="pl-4">{item.output}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleCommand} className="flex items-center gap-2 pt-3 border-t border-white/10 mt-2 text-xs">
        <span className="text-emerald-400 font-semibold">guest@jongjin-mac</span>
        <span className="text-neutral-500">:</span>
        <span className="text-blue-400 font-semibold">~</span>
        <span className="text-neutral-500">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none text-white font-mono"
          placeholder="Type 'help'..."
        />
      </form>
    </div>
  );
};

import React, { useState } from 'react';
import { Trash2, FileText, AlertCircle, RefreshCw, X, FileSpreadsheet, FileCode } from 'lucide-react';

interface TrashFile {
  id: string;
  name: string;
  size: string;
  date: string;
  content: string;
  type: 'txt' | 'log' | 'xlsx' | 'md';
}

export const TrashApp: React.FC = () => {
  const initialFiles: TrashFile[] = [
    {
      id: 'bug',
      name: '버그_최종_진짜최종.txt',
      size: '4.2 KB',
      date: '방금 전',
      type: 'txt',
      content:
        '// 이 파일은 영구히 격리되었습니다.\n\n"진짜 마지막 버그 수정 완료!\n이거 머지하면 이제 프로덕션 배포 무사 통과입니다..."\n\n(5분 뒤 다른 곳에서 런타임 에러가 발생하여 이곳으로 버려짐 😭)',
    },
    {
      id: 'overtime',
      name: '야근기록_2026.log',
      size: '128 KB',
      date: '어제',
      type: 'log',
      content:
        '[23:45:12 INFO] 커피 3잔째 섭취 완료 ☕\n[00:15:40 WARN] 슬슬 눈이 감기기 시작함\n[01:30:22 FATAL] 오타 하나 때문에 2시간 헤맴 (세미콜론)\n[02:00:00 SUCCESS] 드디어 빌드 성공! 퇴근!',
    },
    {
      id: 'diet',
      name: '작심삼일_다이어트계획.xlsx',
      size: '24 KB',
      date: '3일 전',
      type: 'xlsx',
      content:
        '📋 [다이어트 식단 기록표]\n\n• 1일차: 샐러드 & 닭가슴살 (성공)\n• 2일차: 코딩하다 당 떨어져서 초콜릿 2봉지 (위험)\n• 3일차: 치킨과 함께 야근하며 장렬히 전사 🍗',
    },
    {
      id: 'idea',
      name: '초대박_사이드프로젝트_아이디어.md',
      size: '1.2 MB',
      date: '지난주',
      type: 'md',
      content:
        '# 💡 초대박 날 것 같았던 아이디어 모음\n\n1. AI가 내 마음을 읽고 알아서 코딩해주는 도구\n2. 에러가 나면 대신 사과해주는 봇\n3. 키보드 타건음으로 연주하는 리듬게임\n\n...일단 자고 내일 아침에 다시 생각해보자. (영원히 잠듦)',
    },
  ];

  const [files, setFiles] = useState<TrashFile[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<TrashFile | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleEmptyTrash = () => {
    setIsClearing(true);
    setTimeout(() => {
      setFiles([]);
      setSelectedFile(null);
      setIsClearing(false);
    }, 400);
  };

  const handleRestore = () => {
    setFiles(initialFiles);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'xlsx':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-400" />;
      case 'log':
        return <AlertCircle className="w-8 h-8 text-amber-400" />;
      case 'md':
        return <FileCode className="w-8 h-8 text-sky-400" />;
      default:
        return <FileText className="w-8 h-8 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e20] text-neutral-200 select-none font-sans">
      {/* 상단 툴바 */}
      <div className="h-10 bg-white/5 border-b border-white/10 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
          <Trash2 className="w-4 h-4 text-neutral-400" />
          <span>휴지통</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-400 font-mono">
            {files.length}개 항목
          </span>
        </div>

        <div className="flex items-center gap-2">
          {files.length > 0 ? (
            <button
              onClick={handleEmptyTrash}
              disabled={isClearing}
              className="px-2.5 py-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isClearing ? '비우는 중...' : '휴지통 비우기'}
            </button>
          ) : (
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-neutral-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>항목 다시 채우기</span>
            </button>
          )}
        </div>
      </div>

      {/* 휴지통 본문 그리드 */}
      <div className="flex-1 p-4 overflow-y-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
            <div className="p-4 rounded-full bg-white/5 mb-3 border border-white/5">
              <Trash2 className="w-10 h-10 text-neutral-500" />
            </div>
            <h3 className="text-sm font-semibold text-white">휴지통이 깨끗하게 비워졌습니다! ✨</h3>
            <p className="text-xs text-neutral-400 mt-1">버려진 버그와 잡생각들이 모두 사라졌습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 cursor-pointer transition-all ${
                  selectedFile?.id === file.id
                    ? 'bg-blue-600/25 border-blue-400/50'
                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                }`}
              >
                <div className="p-2 rounded-lg bg-black/20">{getFileIcon(file.type)}</div>
                <div className="w-full">
                  <p className="text-xs font-medium text-neutral-200 truncate w-full" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{file.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 파일 내용 미리보기 모달 */}
      {selectedFile && (
        <div className="border-t border-white/10 bg-[#141416] p-4 flex flex-col max-h-48 flex-shrink-0 animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-bold text-white">{selectedFile.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 rounded hover:bg-white/10 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="text-xs font-mono text-neutral-300 whitespace-pre-wrap overflow-y-auto flex-1 select-text">
            {selectedFile.content}
          </pre>
        </div>
      )}
    </div>
  );
};

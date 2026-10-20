import React from 'react';
import { Trash2 } from 'lucide-react';

export const TrashApp: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-neutral-300 h-full select-none">
      <div className="p-4 rounded-full bg-white/10 mb-3">
        <Trash2 className="w-10 h-10 text-neutral-400" />
      </div>
      <h3 className="text-sm font-semibold text-white">휴지통이 비어 있습니다</h3>
      <p className="text-xs text-neutral-400 mt-1">삭제된 항목이 없습니다.</p>
    </div>
  );
};

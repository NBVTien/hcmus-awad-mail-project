import React from 'react';
import { ArrowLeft } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export const MobileBackButton: React.FC<Props> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 rounded"
      aria-label="Back to email list"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </button>
  );
};

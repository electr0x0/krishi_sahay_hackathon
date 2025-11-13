'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HelpTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const HelpTooltip = ({ content, side = 'top' }: HelpTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ml-1"
          aria-label="সাহায্য"
        >
          <Info className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs bg-gray-900 text-white">
        <p className="text-sm">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default HelpTooltip;


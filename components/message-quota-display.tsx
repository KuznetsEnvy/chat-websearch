'use client';

import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function PureMessageQuotaDisplay({
  dailyQuota,
  messagesLeft,
}: {
  dailyQuota: number;
  messagesLeft: number;
}) {
  // Calculate percentage of messages left for styling
  const percentLeft = (messagesLeft / dailyQuota) * 100;

  // Determine text color based on percentage left
  const getTextColorClass = () => {
    if (percentLeft <= 10) return "text-red-500 dark:text-red-400";
    if (percentLeft <= 25) return "text-amber-500 dark:text-amber-400";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`px-2 text-xs flex items-center ${getTextColorClass()}`}
            data-testid="message-quota-display"
          >
            <span>{messagesLeft} / {dailyQuota}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your remaining daily messages</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const MessageQuotaDisplay = memo(PureMessageQuotaDisplay);
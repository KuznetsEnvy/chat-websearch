'use client';

import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function PureMessageQuotaDisplay({
  dailyQuota,
}: {
  dailyQuota: number;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="px-2 text-xs text-muted-foreground flex items-center"
            data-testid="message-quota-display"
          >
            <span>{dailyQuota}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Your daily message limit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const MessageQuotaDisplay = memo(PureMessageQuotaDisplay);
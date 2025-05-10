'use client';

import { memo } from 'react';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function PureMessageQuotaDisplay({
  session,
}: {
  session: Session;
}) {
  const userType = session.user.type;
  const { maxMessagesPerDay } = entitlementsByUserType[userType];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className="px-2 text-xs text-muted-foreground flex items-center"
            data-testid="message-quota-display"
          >
            <span>{maxMessagesPerDay}</span>
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
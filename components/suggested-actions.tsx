'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
  useWebSearch?: boolean;
  onToggleWebSearch?: () => void;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
  useWebSearch = false,
  onToggleWebSearch,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: 'What is the score',
      label: 'Manchester United and Athletic Club?',
      action: 'What is the score of the latest match between Manchester United - Athletic Club?',
    },
    {
      title: 'What is the current price',
      label: `for the NASDAQ Composite Index`,
      action: `What is the current NASDAQ price?`,
    },
    {
      title: 'Help me write an essay',
      label: `about silicon valley`,
      action: `Help me write an essay about silicon valley`,
    },
    {
      title: 'What is the weather',
      label: 'in Barcelona?',
      action: 'What is the weather in Barcelona?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="grid sm:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{suggestedAction.title}</span>
              {useWebSearch && (
                <span className="text-xs text-blue-500 dark:text-blue-400 ml-1">
                  Web
                </span>
              )}
            </div>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.useWebSearch !== nextProps.useWebSearch)
      return false;

    return true;
  },
);

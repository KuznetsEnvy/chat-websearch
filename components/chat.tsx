'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { getUserMessageCount } from '@/app/(chat)/quota-actions';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { mutate } = useSWRConfig();

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,

    experimental_prepareRequestBody: (body) => {
      // TODO Kuz: ask Claude Code how this works
      // Prepare the request body with web search flag
      const requestBody = {
        id,
        message: body.messages.at(-1),
        selectedChatModel: initialChatModel,
        selectedVisibilityType: visibilityType,
        webSearchEnabled: webSearchEnabled,
      };

      // Reset web search flag after sending
      if (webSearchEnabled) {
        setWebSearchEnabled(false);
      }

      return requestBody;
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));
      refreshMessageCount(); // Refresh message count after each message
    },
    onError: (error) => {
      toast({
        type: 'error',
        description: error.message,
      });
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  // region Daily Quota CTA
  // TODO Kuz: Ask Claude Code how to understanding if `useState` is needed or not here?
  // Calculate daily quota from user type
  const userType = session.user.type;
  // console.log('Chat userId: ' + session.user.id);
  // console.log('Chat userType: ' + userType);
  const { maxMessagesPerDay } = entitlementsByUserType[userType];

  // Fetch current message count for the user
  const { data: messageCount = 0, mutate: refreshMessageCount } = useSWR(
    `user-message-count-${session.user.id}`,
    () => getUserMessageCount(session.user.id),
    { refreshInterval: 60000 } // Refresh every minute
  );

  // Calculate messages left
  const messagesLeft = Math.max(0, maxMessagesPerDay - messageCount);
  // endregion Daily Quota CTA

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Function to toggle web search
  const toggleWebSearch = useCallback(() => {
    setWebSearchEnabled(prev => {
      const newState = !prev;

      // console.log('%c' + 'Chat toggleWebSearch newState: ' + newState, 'color: green;');

      return newState;
    });
  }, []);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={initialChatModel}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              useWebSearch={webSearchEnabled}
              onToggleWebSearch={toggleWebSearch}
              messages={messages}
              setMessages={setMessages}
              append={append}
              selectedVisibilityType={visibilityType}
              dailyQuota={maxMessagesPerDay}
              messagesLeft={messagesLeft}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        useWebSearch={webSearchEnabled}
        onToggleWebSearch={toggleWebSearch}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}

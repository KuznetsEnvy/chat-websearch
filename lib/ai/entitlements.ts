import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /* For users without an account */
  guest: {
    maxMessagesPerDay: 30,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },

  /* For users with an account */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning'],
  },

  premium: {
    maxMessagesPerDay: 200,
    availableChatModelIds: ['chat-model', 'chat-model-reasoning']
  }
};

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  mockArtifactModel,
  mockChatModel,
  mockReasoningModel,
  mockTitleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': mockChatModel,
        'chat-model-reasoning': mockReasoningModel,
        'title-model': mockTitleModel,
        'artifact-model': mockArtifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': openai('gpt-4o-mini'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('o4-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-4o-mini'),
        'artifact-model': openai('gpt-4o-mini'),
      },
      imageModels: {
        'small-model': openai.image('dall-e-2'),
      },
    });

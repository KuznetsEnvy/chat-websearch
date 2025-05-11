'use server';

import { getMessageCountByUserId } from '@/lib/db/queries';

export async function getUserMessageCount(userId: string) {
  try {
    // Get the message count for the last 24 hours (24 hours = 24)
    const count = await getMessageCountByUserId({ 
      id: userId, 
      differenceInHours: 24 
    });
    
    return count;
  } catch (error) {
    console.error('Failed to get user message count:', error);
    return 0;
  }
}
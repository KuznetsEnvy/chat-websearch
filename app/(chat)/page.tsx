import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { Modal } from '@/components/ui/modal';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';


type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const session = await auth();

  if (!session) {
    console.log('Session not found, redirecting to /api/auth/guest.');
    redirect('/api/auth/guest');
  }

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');


  // Await the promises to get actual values
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // console.log('Page params:');
  // console.log(resolvedParams);
  // console.log(resolvedSearchParams);

  const show = resolvedSearchParams?.show;
  
  // console.log('Page session type:');
  // console.log({ session });

  const initialChatModel = modelIdFromCookie ?  modelIdFromCookie.value : DEFAULT_CHAT_MODEL;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={initialChatModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
      {show && session.user.type === 'regular' && <Modal />}
    </>
  );
}

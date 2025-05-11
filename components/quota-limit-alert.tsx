'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

function PureQuotaLimitAlert() {
  return (
    <Card className="w-full max-w-md mx-auto border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
      <CardHeader>
        <CardTitle className="text-amber-700 dark:text-amber-400">Daily Message Limit Reached</CardTitle>
        <CardDescription>You have used all your free messages for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          To continue using the chat, please sign in or create an account.
          Registered users get more messages per day.
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button asChild variant="default">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild variant="default">
          <Link href="/register">Register</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export const QuotaLimitAlert = memo(PureQuotaLimitAlert);

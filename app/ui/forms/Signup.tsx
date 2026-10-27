'use client';

import { useActionState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/components/ui/button';
import { signup, type SignupState } from '@/app/lib/actions';
import AlertBar from '@/app/ui/AlertBar';

const initialState: SignupState = { alerts: [] };

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signup, initialState);

  return (
    <form action={formAction} className="space-y-3 mt-8">
      <div className="flex-1 md:w-1/2 rounded-lg bg-muted mx-auto px-6 py-4">
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                defaultValue={state.email}
                required
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium" htmlFor="re-password">
              Re-Enter Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-ring bg-background py-2.25 pl-5 text-sm outline-2 placeholder:text-foreground/50"
                id="re-password"
                type="password"
                name="re-password"
                placeholder="Re-enter password"
                required
                minLength={6}
              />
            </div>
          </div>
        </div>
        <Button className="mt-4 w-full" type="submit" disabled={isPending}>
          Create Account <ArrowRightIcon className="ml-auto h-5 w-5" />
        </Button>
        <AlertBar alerts={state.alerts} />
      </div>
    </form>
  );
}
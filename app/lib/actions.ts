'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AlertMessage } from '@/app/ui/AlertBar';

export type LoginState = {
  alerts: AlertMessage[];
  email?: string;
};

export async function login(
  prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const alerts: AlertMessage[] = [];

  // Validation (errors / warnings)
  if (!email) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: 'Please enter your email address.' });
  }
  if (!password) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: 'Please enter your password.' });
  } else if (password.length < 6) {
    alerts.push({ id: crypto.randomUUID(), type: 'warning', message: 'Passwords are at least 6 characters long.' });
  }
  if (alerts.length > 0) return { alerts, email };

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: error.message });
    alerts.push({
      id: crypto.randomUUID(),
      type: 'info',
      message: "Don't have an account yet? Sign up to get started.",
    });
    return { alerts, email };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export type SignupState = {
  alerts: AlertMessage[];
  email?: string;
};

export async function signup(
  prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const supabase = await createClient();

  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const rePassword = formData.get('re-password') as string;
  const alerts: AlertMessage[] = [];

  // Validation (errors / warnings)
  if (!email) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: 'Please enter your email address.' });
  }
  if (!password) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: 'Please enter a password.' });
  } else if (password.length < 6) {
    alerts.push({ id: crypto.randomUUID(), type: 'warning', message: 'Passwords must be at least 6 characters long.' });
  } else if (password !== rePassword) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: 'Passwords do not match.' });
  }
  if (alerts.length > 0) return { alerts, email };

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    alerts.push({ id: crypto.randomUUID(), type: 'error', message: error.message });
    return { alerts, email };
  }

  if (data.user && data.user.identities?.length === 0) {
    alerts.push({
      id: crypto.randomUUID(),
      type: 'warning',
      message: 'An account with this email may already exist.',
    });
    alerts.push({
      id: crypto.randomUUID(),
      type: 'info',
      message: 'Try logging in instead, or reset your password.',
    });
    return { alerts, email };
  }

  revalidatePath('/', 'layout');
  redirect('/confirm');
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/login', 'layout')
  redirect('/')
}

export async function deleteActivity(id: string) {
  revalidatePath('/activites');
}
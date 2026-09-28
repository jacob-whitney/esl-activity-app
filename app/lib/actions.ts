'use server';

import { revalidatePath } from 'next/cache';

export async function deleteActivity(id: string) {
  revalidatePath('/activites');
}
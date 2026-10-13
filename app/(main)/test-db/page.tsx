import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: activities, error } = await supabase
    .from('activities')
    .select(`
      id, title, description, image_src, image_alt,
      attachments ( id, name, url, size_bytes ),
      activity_categories ( sort_order, categories ( id, name ) )
    `)
    .order('sort_order')

  if (error) {
    return <pre>Error: {error.message}</pre>
  }

  return (
    <ul>
      {activities?.map((activity) => (
        <li key={activity.id}>
          <strong>{activity.title}</strong>: {activity.description}
        </li>
      ))}
    </ul>
  )
}
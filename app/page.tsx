import Assessment from '@/components/Assessment';
import { getMinistryConfig } from '@/lib/notion';

// Ministry areas are re-read from Notion at most once a minute.
export const revalidate = 60;

export default async function Page() {
  const { ministries, show } = await getMinistryConfig();
  return <Assessment ministries={show ? ministries : []} />;
}

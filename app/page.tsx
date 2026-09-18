import Assessment from '@/components/Assessment';
import { getHeroSettings, getMinistryConfig } from '@/lib/notion';

// Ministry areas and the header banner are re-read from Notion at most once a minute.
export const revalidate = 60;

export default async function Page() {
  const [{ ministries, show }, hero] = await Promise.all([getMinistryConfig(), getHeroSettings()]);
  return <Assessment ministries={show ? ministries : []} hero={hero} />;
}

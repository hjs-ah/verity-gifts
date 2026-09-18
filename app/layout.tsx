import type { Metadata } from 'next';
import '@fontsource-variable/sora';
import '@fontsource-variable/figtree';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spiritual Gifts Assessment | Verity Outreach Worship Center',
  description: 'Discover how God has gifted you and where those gifts can serve.',
};

// Light by default. A saved choice is applied before first paint to avoid a flash.
const themeScript = `try{var t=localStorage.getItem('vow-theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

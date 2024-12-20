import './globals.css';
import type { Metadata } from 'next';
import { Sarabun } from 'next/font/google';

const sarabun = Sarabun({
  subsets: ['thai', 'latin'],
  weight: '100'
});

export const metadata: Metadata = {
  title: 'OrderHub',
  description: '',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      {/* <body className={`flex h-screen w-full`}> */}
      <body className={`${sarabun.className} flex h-screen w-full`}>
        <div className="flex flex-col w-full overflow-auto">
          {children}
        </div>
      </body>
    </html>
  );
}


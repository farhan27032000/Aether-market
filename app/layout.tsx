import './globals.css';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aether Market',
  description: 'Market Intelligence & Terminal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

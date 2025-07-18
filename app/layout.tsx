import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Foca no Edital',
  description: 'Foca no Edital',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

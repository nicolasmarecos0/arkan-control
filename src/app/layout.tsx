import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ARKAN Control',
  description: 'ARKAN Control — P2-A foundation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}

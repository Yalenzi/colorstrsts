import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Color Testing App',
  description: 'Advanced Color Testing System for Drug and Psychoactive Substance Detection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '瀛州纪 | Immortal Ledger',
  description: '一个被记录在链上的文明的最后纪元',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-yingzhou-dark text-gray-100 font-mono">
        {children}
      </body>
    </html>
  )
}


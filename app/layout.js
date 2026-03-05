import './globals.css'

export const metadata = {
  title: 'ConnectNow – Random Video Chat',
  description: 'Meet strangers instantly with secure video chat',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#080C18] text-white min-h-screen">{children}</body>
    </html>
  )
}

// filepath: app/layout.tsx

import "../styles/globals.css";
import { Providers } from "../providers";

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
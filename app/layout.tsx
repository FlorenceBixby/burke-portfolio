import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Burke Ruder | Connectivity Cloud & Photography",
  description: "Enterprise Sales @ Cloudflare & Photographer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}

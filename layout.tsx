import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hams",
  description: "Say it without saying it — for Jordanian university students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import AppShell from "./_components/AppShell";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AppShell>{children}</AppShell>

          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}

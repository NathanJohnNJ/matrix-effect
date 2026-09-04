import type { Metadata } from "next";
import "./styles/globals.css";
import Providers from "./providers";
import AppShell from "./components/appShell";

export const metadata: Metadata = {
  title: "Matrix Code Effect",
  description: "A simple web app that displays raining code in the style of the Matrix movie. Users can either display random raining symbols, or type in a string to have the raining symbols stop in a certain position that draws out the string in the style of ASCII art, whilst being surrounded with the random raining symbols.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full w-full antialiased">
      <body className="min-h-full min-w-full flex flex-col">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

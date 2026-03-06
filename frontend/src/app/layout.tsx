import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Life RPG — Level Up Your Life",
  description: "Turn your real-life side quests into an adventure. Complete quests, earn XP, and build a scrapbook journal you can decorate.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="font-body">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}


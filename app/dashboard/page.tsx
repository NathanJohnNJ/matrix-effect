import Link from 'next/link';
import Image from 'next/image';

const effects = [
  {
    href: '/',
    title: 'ASCII Art',
    description: 'Type a phrase and shape the rain into ASCII art.',
    gif: '/matrix.gif',
  },
  {
    href: '/rain',
    title: 'Rain',
    description: 'Watch the unbroken stream of falling symbols.',
    gif: '/rain.gif',
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-green-300">Matrix effect</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Choose an effect</h1>
            <p className="mt-3 max-w-xl text-zinc-400">Explore the interactive canvas or let the symbols fall uninterrupted.</p>
          </div>
          <Link
            href="/settings"
            className="shrink-0 rounded-xl border border-green-400/40 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-200 transition hover:bg-green-500/20"
          >
            Settings
          </Link>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {effects.map((effect) => (
            <Link
              key={effect.href}
              href={effect.href}
              className="group block transition-transform duration-300 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-300 h-min"
            >
              <article className="overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl shadow-green-950/40">
                <div className="relative aspect-2/1 overflow-hidden bg-black">
                  <Image
                    src={effect.gif}
                    alt={`${effect.title} animated preview`}
                    fill
                    unoptimized
                    className="object-contain"
                    loading="eager"
                  />
                  <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-green-200 backdrop-blur-sm">
                    Open effect
                  </span>
                </div>
                <div className="border-t border-white/10 p-5">
                  <h2 className="text-xl font-semibold text-white">{effect.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{effect.description}</p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

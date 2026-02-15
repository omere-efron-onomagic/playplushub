import { Navbar } from '@/ui/components/Navbar';
import { SocketProvider } from '@/sockets/SocketProvider';
import { useMemo } from 'react';
import { Outlet } from 'react-router';

export function Root() {
  const socketUrls = useMemo(() => [], []);

  return (
    <SocketProvider urls={socketUrls}>
      <div className="min-h-screen bg-gv-bg">
        <Navbar />
        <main>
          <Outlet />
        </main>

        {/* Floating Avatar Mascot */}
        <button className="group fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gv-gold/40 bg-gradient-to-br from-gv-gold-dark to-gv-gold shadow-lg shadow-gv-gold/20 transition-all hover:scale-110 hover:shadow-gv-gold/30">
          <span className="text-2xl drop-shadow-md">{'\uD83C\uDFAE'}</span>
          {/* Tooltip */}
          <span className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-gv-surface px-3 py-1.5 text-xs text-gv-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Your Avatar
          </span>
        </button>
      </div>
    </SocketProvider>
  );
}

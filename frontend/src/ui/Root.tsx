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
      </div>
    </SocketProvider>
  );
}

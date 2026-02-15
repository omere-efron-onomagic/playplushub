import { Navbar } from '@/ui/components/Navbar';
import { SocketProvider } from '@/sockets/SocketProvider';
import { useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCreateGuestMutation, useGetGuestQuery } from '@/store/apis/auth.api';
import { setGuestIdentity, setGuestProgression } from '@/store/slices/user.slice';

function useGuestHydration() {
  const dispatch = useAppDispatch();
  const { isGuest, guestToken } = useAppSelector((s) => s.user);
  const [createGuest] = useCreateGuestMutation();
  const initRef = useRef(false);

  // Hydrate existing guest from server
  const { data: guestData } = useGetGuestQuery(undefined, {
    skip: !isGuest || !guestToken,
  });

  useEffect(() => {
    if (guestData) {
      dispatch(setGuestProgression(guestData.guest));
    }
  }, [guestData, dispatch]);

  // Create new guest identity if none exists
  useEffect(() => {
    if (!isGuest || guestToken || initRef.current) return;
    initRef.current = true;

    async function init() {
      try {
        const result = await createGuest().unwrap();
        dispatch(
          setGuestIdentity({
            guestToken: result.guestToken,
            id: result.guest.id,
            coins: result.guest.coins,
          }),
        );
      } catch {
        // Stay as local guest if server is unavailable
      }
    }

    void init();
  }, [isGuest, guestToken, createGuest, dispatch]);
}

export function Root() {
  const socketUrls = useMemo(() => [], []);
  useGuestHydration();

  return (
    <SocketProvider urls={socketUrls}>
      <div className="min-h-screen bg-gv-bg">
        <Navbar />
        <main>
          <Outlet />
        </main>

        {/* Floating Avatar Mascot - smaller on mobile to avoid blocking content */}
        <button className="group fixed right-3 bottom-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gv-gold/40 bg-gradient-to-br from-gv-gold-dark to-gv-gold shadow-lg shadow-gv-gold/20 transition-all hover:scale-110 hover:shadow-gv-gold/30 sm:right-5 sm:bottom-5 sm:h-14 sm:w-14">
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

import { Navbar } from '@/ui/components/Navbar';
import { SocketProvider } from '@/sockets/SocketProvider';
import { useEffect, useMemo, useRef } from 'react';
import { Outlet } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useCreateGuestMutation, useGetGuestQuery } from '@/store/apis/auth.api';
import { setGuestIdentity, setGuestProgression } from '@/store/slices/user.slice';
import { StickyBottomAd } from '@/ui/components/ads';

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
            signupPromptCount: result.guest.signupPromptCount,
            signupRequired: result.guest.signupRequired,
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
        <main className="pb-16 sm:pb-20">
          <Outlet />
        </main>

        <StickyBottomAd />
      </div>
    </SocketProvider>
  );
}

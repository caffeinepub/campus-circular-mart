import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProfileSetupModal from './components/ProfileSetupModal';
import BrowseListings from './pages/BrowseListings';
import PostListing from './pages/PostListing';
import MyListings from './pages/MyListings';
import ListingDetail from './pages/ListingDetail';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

function Layout() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster richColors position="top-right" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: BrowseListings,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseListings,
});

const postListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/post',
  component: PostListing,
});

const myListingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-listings',
  component: MyListings,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$listingId',
  component: ListingDetail,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  postListingRoute,
  myListingsRoute,
  listingDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

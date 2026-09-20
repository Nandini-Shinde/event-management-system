import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar';

const pageTitles = [
  { test: (path) => path === '/', title: 'EventHub — Discover experiences' },
  { test: (path) => path === '/events', title: 'Explore Events — EventHub' },
  { test: (path) => path === '/login', title: 'Sign in — EventHub' },
  { test: (path) => path === '/register', title: 'Create account — EventHub' },
  { test: (path) => path === '/my-registrations', title: 'My Registrations — EventHub' },
  { test: (path) => path === '/admin-dashboard', title: 'Admin Dashboard — EventHub' },
  { test: (path) => path === '/create-event', title: 'Create Event — EventHub' },
  { test: (path) => path.startsWith('/edit-event/'), title: 'Edit Event — EventHub' },
  { test: (path) => path.startsWith('/events/'), title: 'Event Details — EventHub' }
];

const getPageTitle = (path) => {
  return (
    pageTitles.find((item) => item.test(path))?.title ||
    'EventHub — Discover experiences'
  );
};

const MainLayout = () => {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    let frame = null;

    const updateScroll = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;

        const progress = scrollable > 0
          ? (window.scrollY / scrollable) * 100
          : 0;

        setScrollProgress(Math.min(Math.max(progress, 0), 100));
        setShowTopButton(window.scrollY > 560);
        frame = null;
      });
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className="site-scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <Navbar />

      <main className="app-main">
        <div key={`${location.pathname}${location.search}`} className="route-view">
          <Outlet />
        </div>
      </main>

      {showTopButton && (
        <button
          type="button"
          className="back-to-top-button"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}
    </>
  );
};

export default MainLayout;

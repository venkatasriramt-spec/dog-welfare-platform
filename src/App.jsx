import React, { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import About from './pages/About';
import ApplicationForm from './pages/ApplicationForm';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import DogProfile from './pages/DogProfile';
import Home from './pages/Home';
import Login from './pages/Login';
import Report from './pages/Report';
import { watchApplications, watchDogs, watchOrganizations, watchSession } from './services';

export default function App() {
  const [page, setPage] = useState('home');
  const [session, setSession] = useState({ user: null, profile: null, loading: true });
  const [dogs, setDogs] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => watchSession(setSession), []);
  useEffect(() => watchDogs(setDogs), []);
  useEffect(() => watchOrganizations(setOrganizations), []);

  useEffect(
    () => (session.profile?.role === 'platform_admin' ? watchApplications(setApplications) : undefined),
    [session.profile?.role]
  );

  useEffect(() => {
    if (session.profile?.role === 'platform_admin' && page !== 'dashboard') {
      setPage('dashboard');
    }
  }, [session.profile?.role, page]);

  const dog = useMemo(
    () => (page.startsWith('dog:') ? dogs.find(d => d.id === page.slice(4)) : null),
    [page, dogs]
  );

  let body =
    page === 'home' ? (
      <Home setPage={setPage} dogs={dogs} organizations={organizations} />
    ) : page === 'about' ? (
      <About />
    ) : page === 'discover' ? (
      <Discover dogs={dogs} setPage={setPage} session={session} />
    ) : page === 'login' ? (
      <Login setPage={setPage} />
    ) : page === 'apply' ? (
      <ApplicationForm session={session} setPage={setPage} />
    ) : page === 'report' && session.user ? (
      <Report session={session} setPage={setPage} />
    ) : page === 'dashboard' && session.user ? (
      <Dashboard
        session={session}
        dogs={dogs}
        organizations={organizations}
        applications={applications}
        setPage={setPage}
      />
    ) : page.startsWith('dog:') ? (
      <DogProfile
        dog={dog}
        setPage={setPage}
        session={session}
        organizations={organizations}
      />
    ) : (
      <Home setPage={setPage} dogs={dogs} organizations={organizations} />
    );

  return (
    <div className={`app-shell ${page === 'dashboard' ? 'workspace-shell' : ''}`}>
      {page !== 'dashboard' && session.profile?.role !== 'platform_admin' && (
        <Header page={page} setPage={setPage} session={session} />
      )}
      <div className="route-view" key={page}>
        {body}
      </div>
      {page !== 'dashboard' && session.profile?.role !== 'platform_admin' && (
        <footer>
          ✦ PawPath <span>Every dog deserves to be seen.</span>
        </footer>
      )}
    </div>
  );
}

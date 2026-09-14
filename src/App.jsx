import React, { useEffect, useMemo, useState } from 'react';
import About from './pages/About';
import ApplicationForm from './pages/ApplicationForm';
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import DogProfile from './pages/DogProfile';
import Home from './pages/Home';
import Login from './pages/Login';
import Report from './pages/Report';
import StaffDogs from './pages/StaffDogs';
import { watchApplications, watchDogs, watchOrganizations, watchSession } from './services';
import WorkspaceShell from './layouts/WorkspaceShell';
import PublicShell from './layouts/PublicShell';

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

  // Force authenticated users into workspace if they try to access public pages
  useEffect(() => {
    if (session.user && !session.loading) {
      if (['home', 'about', 'login'].includes(page)) {
        setPage('dashboard');
      }
    }
  }, [session.user, session.loading, page]);

  const dog = useMemo(
    () => (page.startsWith('dog:') ? dogs.find(d => d.id === page.slice(4)) : null),
    [page, dogs]
  );

  if (session.loading) return null;

  if (session.user) {
    // WORKSPACE ROUTES
    let body;
    if (page === 'dashboard' || page.startsWith('admin_') || page.startsWith('agency_') || page.startsWith('hospital_') || page.startsWith('staffdashboard_')) {
      let currentTab = 'overview';
      if (page.startsWith('admin_')) currentTab = page.replace('admin_', '');
      if (page.startsWith('agency_')) currentTab = page.replace('agency_', '');
      if (page.startsWith('hospital_')) currentTab = page.replace('hospital_', '');
      if (page.startsWith('staffdashboard_')) currentTab = page.replace('staffdashboard_', '');

      body = (
        <Dashboard
          session={session}
          dogs={dogs}
          organizations={organizations}
          applications={applications}
          setPage={setPage}
          currentTab={currentTab}
        />
      );
    } else if (page === 'discover') {
      body = <Discover dogs={dogs} setPage={setPage} session={session} isWorkspace={true} />;
    } else if (page === 'report') {
      body = <Report session={session} setPage={setPage} isWorkspace={true} />;
    } else if (page === 'staff_dogs') {
      body = <StaffDogs session={session} organizations={organizations} setPage={setPage} />;
    } else if (page === 'apply') {
      body = <ApplicationForm session={session} setPage={setPage} isWorkspace={true} />;
    } else if (page.startsWith('dog:')) {
      body = (
        <DogProfile
          dog={dog}
          setPage={setPage}
          session={session}
          organizations={organizations}
          isWorkspace={true}
        />
      );
    } else {
      // Fallback
      body = (
        <Dashboard
          session={session}
          dogs={dogs}
          organizations={organizations}
          applications={applications}
          setPage={setPage}
        />
      );
    }

    return (
      <WorkspaceShell session={session} page={page} setPage={setPage}>
        {body}
      </WorkspaceShell>
    );
  }

  // PUBLIC ROUTES
  let body;
  if (page === 'home') {
    body = <Home setPage={setPage} dogs={dogs} organizations={organizations} />;
  } else if (page === 'about') {
    body = <About />;
  } else if (page === 'discover') {
    body = <Discover dogs={dogs} setPage={setPage} session={session} />;
  } else if (page === 'login') {
    body = <Login setPage={setPage} />;
  } else if (page === 'apply') {
    body = <ApplicationForm session={session} setPage={setPage} />;
  } else if (page.startsWith('dog:')) {
    body = (
      <DogProfile
        dog={dog}
        setPage={setPage}
        session={session}
        organizations={organizations}
      />
    );
  } else {
    body = <Home setPage={setPage} dogs={dogs} organizations={organizations} />;
  }

  return (
    <PublicShell session={session} page={page} setPage={setPage}>
      {body}
    </PublicShell>
  );
}

import './bootstrap';

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { syncCsrfToken } from './utils/helpers';
import TopBar from './components/auth/TopBar';
import AuthScreen from './components/auth/AuthScreen';
import Onboarding from './components/auth/Onboarding';
import Dashboard from './components/dashboard/Dashboard';
import LandingPage from './components/landing/LandingPage';

function LoadingScreen() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#d95f43] border-t-transparent" />
        </main>
    );
}

function App() {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [path, setPath] = useState(window.location.pathname);
    const [onboarded, setOnboarded] = useState(() => localStorage.getItem('nexa_onboarded') === 'true');

    useEffect(() => {
        window.axios.get('/auth/me')
            .then(({ data }) => setUser(data.user))
            .finally(() => setLoadingUser(false));

        const syncPath = () => setPath(window.location.pathname);
        window.addEventListener('popstate', syncPath);

        return () => window.removeEventListener('popstate', syncPath);
    }, []);

    const navigate = (nextPath) => {
        window.history.pushState({}, '', nextPath);
        setPath(nextPath);
    };

    const handleLogout = async () => {
        const { data } = await window.axios.post('/auth/logout');
        syncCsrfToken(data.csrf_token);
        setUser(null);
        navigate('/login');
    };

    const authMode = path === '/register' ? 'register' : 'login';

    if (loadingUser) {
        return <LoadingScreen />;
    }

    const handleOnboardingComplete = (mode) => {
        localStorage.setItem('nexa_onboarded', 'true');
        setOnboarded(true);
        if (mode) {
            navigate(`/${mode}`);
        }
    };

    return (
        <main className="min-h-screen bg-[#eef2ff] text-[#1e1033]">
            {user ? (
                <Dashboard user={user} setUser={setUser} onLogout={handleLogout} />
            ) : path === '/' ? (
                <LandingPage onNavigate={navigate} />
            ) : !onboarded ? (
                <Onboarding 
                    initialMode={authMode} 
                    onComplete={handleOnboardingComplete} 
                />
            ) : (
                <AuthScreen
                    mode={authMode}
                    onAuthenticated={(nextUser) => {
                        setUser(nextUser);
                        navigate('/dashboard');
                    }}
                    onNavigate={navigate}
                />
            )}
        </main>
    );
}

createRoot(document.getElementById('root')).render(<App />);

import React from 'react';
import { Screen } from './types';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import DashboardScreen from './screens/DashboardScreen';
import TripSetupScreen from './screens/TripSetupScreen';
import ActiveTripScreen from './screens/ActiveTripScreen';
import AddStopScreen from './screens/AddStopScreen';
import TripSummaryScreen from './screens/TripSummaryScreen';
import TripDetailsScreen from './screens/TripDetailsScreen';
import MonthlyStatsScreen from './screens/MonthlyStatsScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import TripArchiveScreen from './screens/TripArchiveScreen';
import { useAppState } from './hooks/useAppState';
import { HomeIcon, ClockIcon, UserIcon, MapIcon, CloudIcon, CloudOffIcon, RefreshIcon } from './components/Icons';

const App: React.FC = () => {
  const state = useAppState();

  const isMainTab = [Screen.DASHBOARD, Screen.MONTHLY_STATS, Screen.PROFILE_SETTINGS].includes(state.currentScreen);

  const renderScreen = () => {
    switch (state.currentScreen) {
      case Screen.SPLASH:
        return <SplashScreen onComplete={() => state.navigate(Screen.LOGIN)} />;
      case Screen.LOGIN:
        return <LoginScreen onLogin={(phone) => state.login(phone)} />;
      case Screen.PROFILE_SETUP:
        return <ProfileSetupScreen onSave={state.saveProfile} />;
      case Screen.DASHBOARD:
        return (
          <DashboardScreen
            user={state.user}
            trips={state.trips}
            activeTrip={state.activeTrip}
            onStartNewTrip={() => state.navigate(Screen.TRIP_SETUP)}
            onViewTrip={state.viewTrip}
            onViewStats={() => state.navigate(Screen.MONTHLY_STATS)}
            onViewProfile={() => state.navigate(Screen.PROFILE_SETTINGS)}
            onGoToActiveTrip={() => state.navigate(Screen.ACTIVE_TRIP)}
            onViewArchive={() => state.navigate(Screen.TRIP_ARCHIVE)}
          />
        );
      case Screen.TRIP_SETUP:
        return (
          <TripSetupScreen 
            user={state.user}
            onStart={state.startTrip} 
            onBack={() => state.navigate(Screen.DASHBOARD)} 
          />
        );
      case Screen.ACTIVE_TRIP:
        return (
          <ActiveTripScreen 
            trip={state.activeTrip} 
            onAddStop={() => state.navigate(Screen.ADD_STOP)} 
            onEndTrip={state.endTrip}
            onGoHome={() => state.navigate(Screen.DASHBOARD)}
            isOnline={state.isOnline}
          />
        );
      case Screen.ADD_STOP:
        return (
          <AddStopScreen 
            trip={state.activeTrip} 
            onSave={state.addStop} 
            onBack={() => state.navigate(Screen.ACTIVE_TRIP)} 
            isOnline={state.isOnline}
          />
        );
      case Screen.TRIP_SUMMARY:
        return <TripSummaryScreen trip={state.trips[0]} onFinish={() => state.navigate(Screen.DASHBOARD)} />;
      case Screen.TRIP_DETAILS:
        return <TripDetailsScreen trip={state.selectedTrip} onBack={() => state.navigate(Screen.TRIP_ARCHIVE)} />;
      case Screen.MONTHLY_STATS:
        return <MonthlyStatsScreen trips={state.trips} onBack={() => state.navigate(Screen.DASHBOARD)} />;
      case Screen.PROFILE_SETTINGS:
        return <ProfileSettingsScreen user={state.user} onBack={() => state.navigate(Screen.DASHBOARD)} onLogout={state.logout} />;
      case Screen.TRIP_ARCHIVE:
        return (
          <TripArchiveScreen 
            trips={state.trips} 
            onBack={() => state.navigate(Screen.DASHBOARD)} 
            onViewTrip={state.viewTrip}
            onDeleteTrip={state.deleteTrip}
          />
        );
      default:
        return <SplashScreen onComplete={() => state.navigate(Screen.LOGIN)} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-full overflow-hidden relative bg-white">
      {/* Android Status Bar Simulation */}
      <div className="flex justify-between items-center px-6 py-2 bg-transparent z-[100] absolute top-0 w-full">
        <span className="text-[12px] font-bold text-gray-900">9:41</span>
        <div className="flex items-center gap-1.5">
          {!state.isOnline && (
            <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full mr-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              <span className="text-[9px] font-black text-amber-600 uppercase">Offline</span>
            </div>
          )}
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21L1 10C2.5 8.5 4.5 7.5 7 7.5C10 7.5 12.5 9 14 11.5C15.5 9 18 7.5 21 7.5C23.5 7.5 25.5 8.5 27 10L12 21Z"/></svg>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.34V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative mt-8">
        {renderScreen()}
      </div>

      {/* Persistent Active Trip Notification */}
      {state.activeTrip && state.currentScreen !== Screen.ACTIVE_TRIP && state.currentScreen !== Screen.ADD_STOP && state.currentScreen !== Screen.SPLASH && (
        <div 
          onClick={() => state.navigate(Screen.ACTIVE_TRIP)}
          className="absolute bottom-24 left-4 right-4 bg-indigo-600 p-4 rounded-2xl flex items-center justify-between shadow-2xl animate-bounce-subtle cursor-pointer z-50 border border-indigo-400"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MapIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] text-indigo-200 font-black uppercase">Live Journey</p>
              <p className="text-white text-sm font-black truncate max-w-[180px]">{state.activeTrip.destination}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className={`px-2 py-0.5 rounded-full flex items-center gap-1.5 transition-all ${
              state.isOnline ? 'bg-white/10' : 'bg-amber-500/20 animate-pulse'
            }`}>
              {state.isLoading ? (
                <RefreshIcon className="w-3 h-3 text-white animate-spin" />
              ) : state.isOnline ? (
                <CloudIcon className="w-3 h-3 text-emerald-400" />
              ) : (
                <CloudOffIcon className="w-3 h-3 text-amber-400" />
              )}
              <span className="text-[8px] font-black text-white uppercase tracking-tighter">
                {state.isLoading ? 'Syncing...' : state.isOnline ? 'Synced' : 'Pending'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-2 h-2 rounded-full ${state.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-[10px] font-black text-white uppercase">
                {state.isOnline ? 'Resume' : 'Resume (Local)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {isMainTab && (
        <div className="h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-4 z-50 pb-2">
          <NavButton 
            active={state.currentScreen === Screen.DASHBOARD} 
            onClick={() => state.navigate(Screen.DASHBOARD)} 
            icon={<HomeIcon />} 
            label="Home" 
          />
          <NavButton 
            active={state.currentScreen === Screen.MONTHLY_STATS} 
            onClick={() => state.navigate(Screen.MONTHLY_STATS)} 
            icon={<ClockIcon />} 
            label="Insights" 
          />
          <NavButton 
            active={state.currentScreen === Screen.PROFILE_SETTINGS} 
            onClick={() => state.navigate(Screen.PROFILE_SETTINGS)} 
            icon={<UserIcon />} 
            label="Profile" 
          />
        </div>
      )}

      {state.error && (
        <div className="absolute top-12 left-4 right-4 z-[9999] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10">
            <p className="text-xs font-medium">{state.error}</p>
            <button onClick={() => state.setError(null)} className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
        </div>
      )}

      {state.isLoading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-[9998] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-1 group active:scale-90 transition-all"
  >
    <div className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'bg-indigo-100 text-indigo-600 scale-110' : 'text-gray-400 group-hover:text-gray-600'}`}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-6 h-6' })}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-wider transition-all ${active ? 'text-indigo-600 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
      {label}
    </span>
  </button>
);

export default App;
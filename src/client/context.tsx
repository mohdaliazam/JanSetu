import React, { createContext, useState, useEffect, useContext } from 'react';
import { createSession } from './api';

export const translations: Record<string, Record<'en'|'hi', string>> = {
  'JanSetu': { en: 'JanSetu', hi: 'जनसेतु' },
  'synthetic_demo': { en: 'Synthetic Demo', hi: 'सिंथेटिक डेमो' },
  'report_need': { en: 'Report a community need', hi: 'समुदाय की जरूरत की रिपोर्ट करें' },
  'explore_dashboard': { en: 'Explore planning dashboard', hi: 'योजना डैशबोर्ड का अन्वेषण करें' },
  'description': { en: 'Connecting community voices to structured planning data.', hi: 'समुदाय की आवाज़ को योजना डेटा से जोड़ना।' },
  'submit': { en: 'Submit', hi: 'जमा करें' },
  'loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
  'error': { en: 'Error', hi: 'त्रुटि' },
};

interface AppContextType {
  lang: 'en' | 'hi';
  setLang: (lang: 'en' | 'hi') => void;
  providerMode: string;
  sessionExpired: boolean;
  ensureSession: () => Promise<void>;
  t: (key: string) => string;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [providerMode, setProviderMode] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  const ensureSession = async () => {
    try {
      const res = await createSession();
      setProviderMode(res.providerMode);
      setSessionExpired(false);
    } catch (e: any) {
      if (e.code === 'UNAUTHORIZED' || e.message?.includes('401')) {
        setSessionExpired(true);
      }
    }
  };

  useEffect(() => {
    ensureSession();
  }, []);

  const t = (key: string) => {
    return translations[key]?.[lang] || key;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, providerMode, sessionExpired, ensureSession, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('AppProvider missing');
  return ctx;
};

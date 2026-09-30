import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAppContext } from './context';

import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import DraftReviewPage from './pages/DraftReviewPage';
import DashboardPage from './pages/DashboardPage';
import GroupDetailPage from './pages/GroupDetailPage';
import BriefPage from './pages/BriefPage';

const App: React.FC = () => {
  const { lang, setLang, t } = useAppContext();

  return (
    <div className="app-layout">
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-name">{t('JanSetu')}</span>
            <span className="badge badge-synthetic">{t('synthetic_demo')}</span>
          </Link>
          <div className="lang-toggle">
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'hi' ? 'active' : ''} onClick={() => setLang('hi')}>हिंदी</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/report/:draftId" element={<DraftReviewPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
            <Route path="/groups/:id/brief" element={<BriefPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;

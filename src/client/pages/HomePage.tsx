import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';

const HomePage: React.FC = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="home-hero">
        <h1>{t('JanSetu')}</h1>
        <p>{t('description')}</p>
        
        <div className="home-actions">
          <button className="btn btn-primary" onClick={() => navigate('/report')}>
            {t('report_need')}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            {t('explore_dashboard')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppContext } from '../context';
import { generateBrief } from '../api';

const BriefPage: React.FC = () => {
  const { id } = useParams();
  const { t } = useAppContext();
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadBrief = () => {
    if (!id) return;
    setLoading(true);
    generateBrief(id).then(res => {
      setBrief(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    loadBrief();
  }, [id]);

  if (loading) return <div>{t('loading')}</div>;
  if (!brief) return <div>Not found</div>;

  return (
    <div className="brief-page">
      <h2>{brief.title || 'Project Brief'}</h2>
      <div className="badges">
        <span className="badge synthetic-badge">Synthetic</span>
        <span className="badge ai-mode-badge">AI Generated</span>
      </div>
      
      {brief.stale && (
        <div className="warning">
          This brief might be stale due to new data.
          <button onClick={loadBrief}>Regenerate</button>
        </div>
      )}

      <div className="timestamp">Generated: {new Date(brief.createdAt || Date.now()).toLocaleString()}</div>

      <div className="section rationale">
        <h3>Rationale</h3>
        <ul>
          {brief.rationale?.map((r: string, i: number) => <li key={i}>{r}</li>)}
        </ul>
      </div>

      <div className="section next-steps">
        <h3>Recommended Next Steps</h3>
        <ul>
          {brief.nextSteps?.map((s: string, i: number) => <li key={i}>{s}</li>)}
        </ul>
      </div>

      <div className="section caveats">
        <h3>Caveats</h3>
        <ul>
          {brief.caveats?.map((c: string, i: number) => <li key={i}>{c}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default BriefPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { getDraft, confirmDraft, getLocalities } from '../api';

const DraftReviewPage: React.FC = () => {
  const { draftId } = useParams();
  const navigate = useNavigate();
  const { t, providerMode } = useAppContext();
  
  const [draft, setDraft] = useState<any>(null);
  const [localities, setLocalities] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [localityId, setLocalityId] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!draftId) return;
    Promise.all([
      getDraft(draftId),
      getLocalities()
    ])
    .then(([dRes, lRes]) => {
      setDraft(dRes);
      setCategory(dRes.analysis?.category || dRes.extraction?.category || 'other');
      setLocalityId(dRes.localityId || '');
      setLocalities(lRes.items);
      setLoading(false);
    })
    .catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [draftId]);

  const handleConfirm = async () => {
    if (!draftId || !acknowledged) return;
    setLoading(true);
    try {
      await confirmDraft(draftId, { category, localityId, acknowledged: true });
      setConfirmed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !draft) return <div className="loading">{t('loading')}</div>;
  if (error && !draft) return <div className="error-box">{t('error')}: {error}</div>;

  if (confirmed) {
    return (
      <div className="page">
        <div className="success-box">Report Confirmed successfully!</div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const analysis = draft.analysis || draft.extraction;

  return (
    <div className="page">
      <h2 className="page-title">Review Draft</h2>
      <div className="badge badge-synthetic" style={{marginBottom: '1rem'}}>{providerMode === 'live' ? 'Live AI Mode' : 'Fixture Mode'}</div>
      
      {draft.status === 'failed' && (
        <div className="error-box">
          <p>Analysis failed. Please try again or edit.</p>
          <button className="btn btn-secondary" onClick={() => navigate('/report')}>Edit/Retry</button>
        </div>
      )}

      {draft.status !== 'failed' && analysis && (
        <div className="card">
          <div className="detail-section">
            <p><strong>Redacted Text:</strong> {draft.redactedText}</p>
            <p><strong>Summary:</strong> {analysis.summary || analysis.summary_en}</p>
            <p><strong>Urgency:</strong> {analysis.urgency}</p>
            <p><strong>Evidence:</strong> "{analysis.evidence_quote}"</p>
          </div>
          
          {analysis.needs_review && (
            <div className="warning-box">
              <strong>Needs Review:</strong> {analysis.review_reasons?.join(', ')}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="water">Water</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="sanitation">Sanitation</option>
              <option value="roads">Roads</option>
              <option value="lighting">Lighting</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Locality</label>
            <select className="form-select" value={localityId} onChange={e => setLocalityId(e.target.value)}>
              {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="checkbox-group">
            <input type="checkbox" id="ack" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} />
            <label htmlFor="ack">I acknowledge the information is correct</label>
          </div>

          {error && <div className="error-box" style={{marginTop: '1rem'}}>{error}</div>}

          <button className="btn btn-primary" onClick={handleConfirm} disabled={!acknowledged || loading}>
            {loading ? t('loading') : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DraftReviewPage;

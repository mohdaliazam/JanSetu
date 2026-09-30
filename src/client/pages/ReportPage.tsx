import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { getLocalities, createDraft } from '../api';

const ReportPage: React.FC = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const [localities, setLocalities] = useState<any[]>([]);
  const [stateCode, setStateCode] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [localityId, setLocalityId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getLocalities().then(res => setLocalities(res.items)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localityId || !text) return;
    setLoading(true);
    setError('');
    try {
      const draft = await createDraft({ text, localityId });
      navigate(`/report/${draft.draftId || draft.id}`);
    } catch (err: any) {
      setError(err.message || 'Error creating draft');
    } finally {
      setLoading(false);
    }
  };

  const states = Array.from(new Set(localities.map(l => l.state_code)));
  const districts = Array.from(new Set(localities.filter(l => !stateCode || l.state_code === stateCode).map(l => l.district_id)));
  const filteredLocalities = localities.filter(l => (!stateCode || l.state_code === stateCode) && (!districtId || l.district_id === districtId));

  return (
    <div className="page">
      <h2 className="page-title">{t('report_need')}</h2>
      
      {error && <div className="error-box">{error}</div>}
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="filters-row">
            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-select" value={stateCode} onChange={e => setStateCode(e.target.value)}>
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">District</label>
              <select className="form-select" value={districtId} onChange={e => setDistrictId(e.target.value)} disabled={!stateCode}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Locality</label>
              <select className="form-select" value={localityId} onChange={e => setLocalityId(e.target.value)} disabled={!districtId} required>
                <option value="">Select Locality</option>
                {filteredLocalities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Report Details</label>
            <div className="warning-box">Do not include personal information.</div>
            
            <textarea 
              className="form-textarea"
              value={text} 
              onChange={e => setText(e.target.value)} 
              maxLength={2000} 
              required
              rows={5}
            />
            <div className="char-count">{text.length} / 2000</div>
            
            <div className="example-buttons">
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setText('We need a new water pump here. The old one has been broken for 3 months and the whole village is walking 5km for drinking water.')}>Example EN</button>
              <button className="btn btn-secondary btn-small" type="button" onClick={() => setText('हमारे इलाके में पानी का पंप पिछले 3 महीने से खराब है। कृपया इसे जल्द ठीक कराएं।')}>Example HI</button>
            </div>
          </div>
          
          <button className="btn btn-primary" type="submit" disabled={loading || !localityId || !text}>
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportPage;

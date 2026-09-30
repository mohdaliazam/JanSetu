import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { getGroups } from '../api';

const DashboardPage: React.FC = () => {
  const { t } = useAppContext();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<any[]>([]);
  const [insufficient, setInsufficient] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stateCode, setStateCode] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    getGroups({ state_code: stateCode, district_id: districtId, category }).then(res => {
      setGroups(res.items);
      setInsufficient(res.insufficientData || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [stateCode, districtId, category]);

  return (
    <div className="page">
      <h2 className="page-title">Dashboard</h2>
      
      <div className="filters-row">
        <div className="form-group">
          <input className="form-input" placeholder="State" value={stateCode} onChange={e => setStateCode(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="District" value={districtId} onChange={e => setDistrictId(e.target.value)} />
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        </div>
      </div>

      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-value">{groups.length + insufficient.length}</div>
          <div className="stat-label">Total Groups</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{groups.length}</div>
          <div className="stat-label">Ranked Groups</div>
        </div>
      </div>

      {loading ? <div className="loading">{t('loading')}</div> : (
        <>
          <div className="detail-section">
            <h3>Ranked Groups</h3>
            <div className="card table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Locality</th>
                    <th>Category</th>
                    <th>Reports</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, i) => (
                    <tr key={g.id} onClick={() => navigate(`/groups/${g.id}`)}>
                      <td>{i + 1}</td>
                      <td>{g.locality_name || g.localityId}</td>
                      <td>{g.category}</td>
                      <td>{g.report_count || g.reportCount}</td>
                      <td>{g.score?.toFixed(1)}</td>
                    </tr>
                  ))}
                  {groups.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{textAlign: 'center'}}>No ranked groups found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {insufficient.length > 0 && (
            <div className="detail-section">
              <h3>Insufficient Data</h3>
              <div className="card table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Locality</th>
                      <th>Category</th>
                      <th>Reports</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insufficient.map(g => (
                      <tr key={g.id} onClick={() => navigate(`/groups/${g.id}`)}>
                        <td>{g.locality_name || g.localityId}</td>
                        <td>{g.category}</td>
                        <td>{g.report_count || g.reportCount}</td>
                        <td style={{color: 'var(--color-amber)'}}>Missing indicator data</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardPage;

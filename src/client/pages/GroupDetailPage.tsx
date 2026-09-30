import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context';
import { getGroupDetail, getExport } from '../api';

const GroupDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useAppContext();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      getGroupDetail(id).then(res => {
        setGroup(res);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const handleExport = async () => {
    if (!id) return;
    const data = await getExport(id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `group-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div>{t('loading')}</div>;
  if (!group) return <div>Not found</div>;

  return (
    <div className="group-detail">
      <h2>Group: {group.category} at {group.localityId}</h2>
      <div className="badge synthetic-badge">Synthetic Data</div>
      
      {group.score === null ? (
        <div className="notice missing-data">Missing data to compute score</div>
      ) : (
        <div className="score-chart">
          <h3>Score: {group.score?.toFixed(2)}</h3>
          <div className="bar" style={{ width: `${Math.min(100, (group.score || 0) * 10)}%`, backgroundColor: 'blue', height: '20px' }} />
        </div>
      )}

      <div className="actions">
        <button onClick={() => navigate(`/groups/${id}/brief`)}>Generate Project Brief</button>
        <button onClick={handleExport}>Export JSON</button>
      </div>

      <div className="indicators">
        <h3>Indicators</h3>
        {group.indicators?.map((ind: any, i: number) => (
          <div key={i}>
            {ind.name}: {ind.value} (Source: {ind.source}, Date: {ind.date})
          </div>
        ))}
      </div>

      <div className="reports-list">
        <h3>Reports ({group.reports?.length})</h3>
        <ul>
          {group.reports?.map((r: any) => (
            <li key={r.id}>
              [{r.providerMode}] {r.urgency} - {r.redactedText}
            </li>
          ))}
        </ul>
      </div>

      <div className="related-plans">
        <h3>Related Plans</h3>
        <ul>
          {group.relatedPlans?.map((p: any) => (
            <li key={p.id}>
              {p.title} - <span className={`badge ${p.status}`}>{p.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GroupDetailPage;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../api.js';

const fmt = (d) => new Date(d).toLocaleDateString();

export default function OverdueDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/equipment/overdue').then((r) => setData(r.data)).catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading…</p>;

  return (
    <>
      <h1>Overdue for service</h1>
      <p className="summary">
        <span className={data.count ? 'count alert' : 'count'}>{data.count}</span>
        {data.count === 1 ? ' machine is' : ' machines are'} past its service interval.
      </p>
      {data.count === 0 ? (
        <p className="muted">Everything is within its service interval.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Machine</th><th>Last serviced</th><th>Interval</th><th>Was due</th><th>Overdue by</th><th></th></tr></thead>
            <tbody>
              {data.equipment.map((eq) => (
                <tr key={eq._id}>
                  <td>{eq.name}{eq.location && <div className="muted">{eq.location}</div>}</td>
                  <td>{eq.neverServiced ? 'Never serviced' : fmt(eq.lastServicedDate)}</td>
                  <td>{eq.serviceIntervalDays} days</td>
                  <td>{fmt(eq.dueDate)}</td>
                  <td><strong className="alert">{eq.daysOverdue} {eq.daysOverdue === 1 ? 'day' : 'days'}</strong></td>
                  <td><Link className="link" to={`/log?equipment=${eq._id}`}>Log maintenance</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

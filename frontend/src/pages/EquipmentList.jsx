import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { API_BASE, errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';

const fmt = (d) => (d ? new Date(d).toLocaleDateString() : 'Never');

function History({ equipmentId }) {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    api.get(`/equipment/${equipmentId}/logs`).then((r) => setLogs(r.data)).catch(() => setLogs([]));
  }, [equipmentId]);

  if (!logs) return <p className="muted">Loading history…</p>;
  if (!logs.length) return <p className="muted">No maintenance has been logged for this machine yet.</p>;
  return (
    <ul className="history">
      {logs.map((l) => (
        <li key={l._id}>
          <div><strong>{fmt(l.performedOn)}</strong> · {l.type} · {l.technician?.name}</div>
          <div>{l.description}</div>
          {l.photo && <a href={`${API_BASE}/${l.photo}`} target="_blank" rel="noreferrer"><img src={`${API_BASE}/${l.photo}`} alt="Maintenance" /></a>}
        </li>
      ))}
    </ul>
  );
}

export default function EquipmentList() {
  const { isSupervisor } = useAuth();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [edit, setEdit] = useState({});   // id -> interval being edited
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [nu, setNu] = useState({ name: '', location: '', serviceIntervalDays: 30 });

  const load = useCallback(() => api.get('/equipment').then((r) => setItems(r.data)), []);
  useEffect(() => { load().catch((e) => setMsg({ type: 'error', text: errorMessage(e) })); }, [load]);

  const saveInterval = async (id) => {
    try {
      await api.patch(`/equipment/${id}/interval`, { serviceIntervalDays: Number(edit[id]) });
      setEdit(({ [id]: _, ...rest }) => rest);
      setMsg({ type: 'ok', text: 'Service interval updated' });
      load();
    } catch (e) { setMsg({ type: 'error', text: errorMessage(e) }); }
  };

  const addEquipment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/equipment', { ...nu, serviceIntervalDays: Number(nu.serviceIntervalDays) });
      setNu({ name: '', location: '', serviceIntervalDays: 30 });
      setMsg({ type: 'ok', text: 'Equipment added' });
      load();
    } catch (e2) { setMsg({ type: 'error', text: errorMessage(e2) }); }
  };

  return (
    <>
      <h1>Equipment</h1>
      {msg.text && <p className={msg.type === 'error' ? 'error' : 'ok'}>{msg.text}</p>}

      {isSupervisor && (
        <form className="inline-form" onSubmit={addEquipment}>
          <input placeholder="Machine name" value={nu.name} onChange={(e) => setNu({ ...nu, name: e.target.value })} required />
          <input placeholder="Location" value={nu.location} onChange={(e) => setNu({ ...nu, location: e.target.value })} />
          <input type="number" min="1" title="Service interval (days)" value={nu.serviceIntervalDays} onChange={(e) => setNu({ ...nu, serviceIntervalDays: e.target.value })} required />
          <button className="btn">Add machine</button>
        </form>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Machine</th><th>Location</th><th>Last serviced</th><th>Interval (days)</th><th></th></tr>
          </thead>
          <tbody>
            {items.map((eq) => (
              <Fragment key={eq._id}>
                <tr>
                  <td>{eq.name}</td>
                  <td>{eq.location || '—'}</td>
                  <td>{fmt(eq.lastServicedDate)}</td>
                  <td>
                    {isSupervisor && edit[eq._id] !== undefined ? (
                      <span className="inline">
                        <input className="narrow" type="number" min="1" value={edit[eq._id]} onChange={(e) => setEdit({ ...edit, [eq._id]: e.target.value })} />
                        <button className="btn small" onClick={() => saveInterval(eq._id)}>Save</button>
                      </span>
                    ) : (
                      <span className="inline">
                        {eq.serviceIntervalDays}
                        {isSupervisor && <button className="link" onClick={() => setEdit({ ...edit, [eq._id]: eq.serviceIntervalDays })}>Change</button>}
                      </span>
                    )}
                  </td>
                  <td className="actions">
                    <Link className="link" to={`/log?equipment=${eq._id}`}>Log maintenance</Link>
                    <button className="link" onClick={() => setOpen(open === eq._id ? null : eq._id)}>{open === eq._id ? 'Hide history' : 'History'}</button>
                  </td>
                </tr>
                {open === eq._id && (
                  <tr><td colSpan="5"><History equipmentId={eq._id} /></td></tr>
                )}
              </Fragment>
            ))}
            {!items.length && <tr><td colSpan="5" className="muted">No equipment yet.{isSupervisor ? ' Add the first machine above.' : ' Ask a supervisor to add machines.'}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

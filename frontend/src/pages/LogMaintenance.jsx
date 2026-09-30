import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errorMessage } from '../api.js';

const today = () => new Date().toISOString().slice(0, 10);

export default function LogMaintenance() {
  const [params] = useSearchParams();
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState({ equipment: params.get('equipment') || '', type: 'preventive', description: '', performedOn: today() });
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/equipment').then((r) => setEquipment(r.data)); }, []);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (photo) data.append('photo', photo);
      await api.post('/logs', data);
      setMsg({ type: 'ok', text: 'Maintenance logged' });
      setForm({ ...form, description: '' });
      setPhoto(null);
      e.target.reset();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Log maintenance</h1>
      <form className="card form" onSubmit={submit}>
        <label>Machine
          <select value={form.equipment} onChange={set('equipment')} required>
            <option value="">Select a machine…</option>
            {equipment.map((eq) => <option key={eq._id} value={eq._id}>{eq.name}</option>)}
          </select>
        </label>
        <label>Type of work
          <select value={form.type} onChange={set('type')}>
            <option value="preventive">Preventive service</option>
            <option value="corrective">Repair</option>
            <option value="inspection">Inspection</option>
          </select>
        </label>
        <label>Date performed<input type="date" max={today()} value={form.performedOn} onChange={set('performedOn')} required /></label>
        <label>What was done
          <textarea rows="4" value={form.description} onChange={set('description')} minLength={5} required />
        </label>
        <label>Photo (optional, JPEG/PNG/WebP up to 5 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhoto(e.target.files[0] || null)} />
        </label>
        {msg.text && <p className={msg.type === 'error' ? 'error' : 'ok'}>{msg.text}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save log'}</button>
      </form>
    </>
  );
}

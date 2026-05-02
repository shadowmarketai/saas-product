import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { GradientButton } from '@/components/ui/GradientButton';
import api from '@/services/api';

interface Ticket {
  id: number;
  subject: string;
  status: string;
  priority: string;
  created_by_name: string | null;
  created_at: string;
}

interface TicketDetail {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_by_name: string | null;
  created_at: string;
  messages: { id: number; sender_name: string | null; message: string; created_at: string }[];
}

export function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetail | null>(null);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' });
  const [newMessage, setNewMessage] = useState('');

  const fetchTickets = () => {
    api.get<Ticket[]>('/support/tickets').then((r) => setTickets(r.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const handleCreate = async () => {
    await api.post('/support/tickets', form);
    setShowForm(false);
    setForm({ subject: '', description: '', priority: 'medium' });
    fetchTickets();
  };

  const openTicket = async (id: number) => {
    const r = await api.get<TicketDetail>(`/support/tickets/${id}`);
    setSelectedTicket(r.data);
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;
    await api.post(`/support/tickets/${selectedTicket.id}/messages`, { message: newMessage });
    setNewMessage('');
    openTicket(selectedTicket.id);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  if (selectedTicket) {
    return (
      <div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
          <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&larr;</button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.subject}</h1>
            <div className="flex gap-2 mt-1">
              <Badge label={selectedTicket.status} variant={selectedTicket.status === 'open' ? 'warning' : selectedTicket.status === 'resolved' ? 'success' : 'info'} />
              <Badge label={selectedTicket.priority} variant={selectedTicket.priority === 'high' ? 'danger' : 'neutral'} />
            </div>
          </div>
        </motion.div>

        <div className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <p className="text-gray-700">{selectedTicket.description}</p>
          <p className="text-xs text-gray-400 mt-2">Created {new Date(selectedTicket.created_at).toLocaleString()}</p>
        </div>

        <div className="mt-6 space-y-4">
          {selectedTicket.messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm text-gray-900">{m.sender_name || 'Unknown'}</span>
                <span className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-700">{m.message}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <input className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Type a reply..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
          <GradientButton onClick={sendMessage}>Send</GradientButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900">Support</h1>
          <p className="text-gray-500 mt-1">{tickets.length} tickets</p>
        </div>
        <GradientButton onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Ticket'}
        </GradientButton>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-white rounded-2xl p-6 shadow-md border border-gray-100">
          <div className="space-y-4">
            <input className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm h-24 resize-none" placeholder="Describe your issue..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <select className="px-4 py-2 border border-gray-200 rounded-xl text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <div className="flex justify-end">
              <GradientButton onClick={handleCreate}>Submit Ticket</GradientButton>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-3">
        {tickets.map((t) => (
          <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{t.subject}</h4>
              <p className="text-xs text-gray-400 mt-1">#{t.id} - {new Date(t.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2">
              <Badge label={t.status} variant={t.status === 'open' ? 'warning' : t.status === 'resolved' ? 'success' : 'info'} />
              <Badge label={t.priority} variant={t.priority === 'high' ? 'danger' : 'neutral'} />
            </div>
          </button>
        ))}
        {tickets.length === 0 && (
          <div className="text-center py-12 text-gray-400">No tickets yet. Create one if you need help!</div>
        )}
      </motion.div>
    </div>
  );
}

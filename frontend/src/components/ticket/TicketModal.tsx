import { useEffect, useState, useRef } from 'react';
import { useBoardContext } from '../../context/BoardContext';
import { ticketsApi, UpdateTicketData } from '../../api/tickets';
import { commentsApi } from '../../api/comments';
import { labelsApi } from '../../api/labels';
import { usersApi } from '../../api/users';
import { Ticket, Comment, Label, User, Status, Priority, PRIORITY_STYLES, COLUMNS } from '../../types';
import { CommentList } from '../comments/CommentList';
import { CommentForm } from '../comments/CommentForm';

export function TicketModal() {
  const { selectedTicketId, dispatch, tickets } = useBoardContext();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [editDesc, setEditDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!selectedTicketId) {
      setTicket(null);
      return;
    }
    setLoading(true);
    Promise.all([
      ticketsApi.getById(selectedTicketId),
      commentsApi.getByTicket(selectedTicketId),
      labelsApi.getAll(),
      usersApi.getAll(),
    ])
      .then(([ticketRes, commentsRes, labelsRes, usersRes]) => {
        setTicket(ticketRes.data);
        setTitleValue(ticketRes.data.title);
        setDescValue(ticketRes.data.description);
        setComments(commentsRes.data);
        setAllLabels(labelsRes.data);
        setAllUsers(usersRes.data);
      })
      .finally(() => setLoading(false));
  }, [selectedTicketId]);

  useEffect(() => {
    if (editTitle) titleRef.current?.focus();
  }, [editTitle]);

  useEffect(() => {
    if (editDesc) descRef.current?.focus();
  }, [editDesc]);

  async function update(data: UpdateTicketData) {
    if (!ticket) return;
    const { data: updated } = await ticketsApi.update(ticket.id, data);
    setTicket(updated);
    dispatch({ type: 'UPDATE_TICKET', payload: updated });
  }

  async function handleTitleSave() {
    if (titleValue.trim() && titleValue !== ticket?.title) {
      await update({ title: titleValue.trim() });
    }
    setEditTitle(false);
  }

  async function handleDescSave() {
    if (descValue !== ticket?.description) {
      await update({ description: descValue });
    }
    setEditDesc(false);
  }

  async function handleStatusChange(status: Status) {
    await update({ status });
  }

  async function handlePriorityChange(priority: Priority) {
    await update({ priority });
  }

  async function handleAssigneeChange(assigneeId: number | null) {
    await update({ assignee_id: assigneeId });
  }

  async function handleLabelToggle(labelId: number) {
    if (!ticket) return;
    const currentIds = ticket.labels.map((l) => l.id);
    const newIds = currentIds.includes(labelId)
      ? currentIds.filter((id) => id !== labelId)
      : [...currentIds, labelId];
    await update({ label_ids: newIds });
  }

  async function handleDelete() {
    if (!ticket) return;
    if (!confirm('Ticket wirklich löschen?')) return;
    await ticketsApi.delete(ticket.id);
    dispatch({ type: 'DELETE_TICKET', ticketId: ticket.id });
    dispatch({ type: 'SELECT_TICKET', ticketId: null });
  }

  if (!selectedTicketId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) dispatch({ type: 'SELECT_TICKET', ticketId: null });
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {loading || !ticket ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100">
              <div className="flex-1 mr-4">
                {editTitle ? (
                  <input
                    ref={titleRef}
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="text-xl font-bold text-gray-900 w-full border-b-2 border-blue-500 outline-none bg-transparent"
                  />
                ) : (
                  <h2
                    className="text-xl font-bold text-gray-900 cursor-text hover:bg-gray-50 rounded px-1 -mx-1"
                    onClick={() => setEditTitle(true)}
                  >
                    {ticket.title}
                  </h2>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Ticket #{ticket.id} · Erstellt{' '}
                  {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                </p>
              </div>
              <button
                onClick={() => dispatch({ type: 'SELECT_TICKET', ticketId: null })}
                className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden">
              {/* Main content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Description */}
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Beschreibung</h3>
                {editDesc ? (
                  <textarea
                    ref={descRef}
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    onBlur={handleDescSave}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div
                    className="text-sm text-gray-600 cursor-text hover:bg-gray-50 rounded p-2 -mx-2 min-h-[60px] whitespace-pre-wrap"
                    onClick={() => setEditDesc(true)}
                  >
                    {ticket.description || (
                      <span className="text-gray-400 italic">Klicken um Beschreibung hinzuzufügen...</span>
                    )}
                  </div>
                )}

                {/* Labels */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Labels</h3>
                  <div className="flex flex-wrap gap-2">
                    {allLabels.map((label) => {
                      const isActive = ticket.labels.some((l) => l.id === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => handleLabelToggle(label.id)}
                          className={`px-2 py-1 rounded text-xs font-medium border-2 transition-all ${
                            isActive ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                          style={isActive ? { backgroundColor: label.color, borderColor: label.color } : {}}
                        >
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Kommentare ({comments.length})
                  </h3>
                  <CommentList
                    ticketId={ticket.id}
                    comments={comments}
                    onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
                  />
                  <CommentForm
                    ticketId={ticket.id}
                    onAdded={(c) => setComments((prev) => [...prev, c])}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-56 border-l border-gray-100 p-4 space-y-4 overflow-y-auto flex-shrink-0">
                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Status
                  </label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value as Status)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Priorität
                  </label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {(['critical', 'high', 'medium', 'low'] as Priority[]).map((p) => (
                      <option key={p} value={p}>
                        {PRIORITY_STYLES[p].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Zugewiesen an
                  </label>
                  <select
                    value={ticket.assignee?.id ?? ''}
                    onChange={(e) =>
                      handleAssigneeChange(e.target.value ? Number(e.target.value) : null)
                    }
                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Nicht zugewiesen</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={handleDelete}
                    className="w-full text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-2 py-1.5 transition-colors text-left"
                  >
                    Ticket löschen
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

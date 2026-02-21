import { useState, FormEvent } from 'react';
import { commentsApi } from '../../api/comments';
import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  ticketId: number;
  onAdded: (comment: Comment) => void;
}

export function CommentForm({ ticketId, onAdded }: Props) {
  const { user } = useAuth();
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    try {
      const { data } = await commentsApi.create(ticketId, body.trim());
      onAdded(data);
      setBody('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-4">
      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
        {user ? getInitials(user.name) : '?'}
      </div>
      <div className="flex-1">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Kommentar schreiben..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-1">
          <button
            type="submit"
            disabled={loading || !body.trim()}
            className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Senden...' : 'Kommentieren'}
          </button>
        </div>
      </div>
    </form>
  );
}

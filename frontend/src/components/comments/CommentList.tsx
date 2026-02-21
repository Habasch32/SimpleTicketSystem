import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { commentsApi } from '../../api/comments';

interface Props {
  ticketId: number;
  comments: Comment[];
  onDeleted: (commentId: number) => void;
}

export function CommentList({ ticketId, comments, onDeleted }: Props) {
  const { user } = useAuth();

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async function handleDelete(commentId: number) {
    if (!confirm('Kommentar löschen?')) return;
    await commentsApi.delete(ticketId, commentId);
    onDeleted(commentId);
  }

  if (comments.length === 0) {
    return <p className="text-sm text-gray-400 mt-2">Noch keine Kommentare.</p>;
  }

  return (
    <div className="space-y-4 mt-2">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {getInitials(c.author.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-gray-800">{c.author.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                {user?.id === c.author.id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Löschen
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap">{c.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

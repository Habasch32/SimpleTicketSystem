import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useBoardContext } from '../../context/BoardContext';
import { ticketsApi } from '../../api/tickets';

export function Navbar() {
  const { user, logout } = useAuth();
  const { tickets, dispatch } = useBoardContext();
  const navigate = useNavigate();

  function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  async function handleCreateTicket() {
    const title = prompt('Neues Ticket – Titel:');
    if (!title?.trim()) return;
    try {
      const { data } = await ticketsApi.create({ title: title.trim() });
      dispatch({ type: 'ADD_TICKET', payload: data });
    } catch {
      alert('Ticket konnte nicht erstellt werden');
    }
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-sm">TicketApp</span>
      </div>

      {/* Stats */}
      <span className="text-sm text-gray-500 hidden sm:block">
        {tickets.length} Tickets
      </span>

      <div className="flex-1" />

      {/* Create Ticket Button */}
      <button
        onClick={handleCreateTicket}
        className="flex items-center gap-1.5 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:block">Neues Ticket</span>
      </button>

      {/* User Menu */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            {getInitials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user.name}</p>
            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-2 text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
            title="Abmelden"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}

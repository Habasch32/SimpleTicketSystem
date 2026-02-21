import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Ticket, Status } from '../types';
import { ticketsApi } from '../api/tickets';

interface BoardState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicketId: number | null;
}

type BoardAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_TICKETS'; payload: Ticket[] }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'MOVE_TICKET_OPTIMISTIC'; ticketId: number; status: Status; position: number }
  | { type: 'MOVE_TICKET_ROLLBACK'; previousTickets: Ticket[] }
  | { type: 'MOVE_TICKET_CONFIRM'; ticket: Ticket }
  | { type: 'ADD_TICKET'; payload: Ticket }
  | { type: 'UPDATE_TICKET'; payload: Ticket }
  | { type: 'DELETE_TICKET'; ticketId: number }
  | { type: 'SELECT_TICKET'; ticketId: number | null };

function reducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_TICKETS':
      return { ...state, loading: false, tickets: action.payload };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'MOVE_TICKET_OPTIMISTIC':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.ticketId
            ? { ...t, status: action.status, position: action.position }
            : t
        ),
      };
    case 'MOVE_TICKET_ROLLBACK':
      return { ...state, tickets: action.previousTickets };
    case 'MOVE_TICKET_CONFIRM':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.ticket.id ? action.ticket : t
        ),
      };
    case 'ADD_TICKET':
      return { ...state, tickets: [...state.tickets, action.payload] };
    case 'UPDATE_TICKET':
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case 'DELETE_TICKET':
      return {
        ...state,
        tickets: state.tickets.filter((t) => t.id !== action.ticketId),
        selectedTicketId:
          state.selectedTicketId === action.ticketId ? null : state.selectedTicketId,
      };
    case 'SELECT_TICKET':
      return { ...state, selectedTicketId: action.ticketId };
    default:
      return state;
  }
}

interface BoardContextValue {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicketId: number | null;
  dispatch: React.Dispatch<BoardAction>;
  refreshTickets: () => Promise<void>;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tickets: [],
    loading: true,
    error: null,
    selectedTicketId: null,
  });

  const refreshTickets = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await ticketsApi.getAll();
      dispatch({ type: 'SET_TICKETS', payload: data });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Tickets konnten nicht geladen werden' });
    }
  }, []);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  return (
    <BoardContext.Provider value={{ ...state, dispatch, refreshTickets }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoardContext() {
  const ctx = useContext(BoardContext);
  if (!ctx) throw new Error('useBoardContext must be used inside BoardProvider');
  return ctx;
}

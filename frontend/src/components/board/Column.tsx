import { Droppable } from '@hello-pangea/dnd';
import { Ticket, ColumnDef } from '../../types';
import { TicketCard } from './TicketCard';
import { useBoardContext } from '../../context/BoardContext';
import { ticketsApi } from '../../api/tickets';

interface Props {
  column: ColumnDef;
  tickets: Ticket[];
}

export function Column({ column, tickets }: Props) {
  const { dispatch } = useBoardContext();

  async function handleAddTicket() {
    const title = prompt('Ticket-Titel:');
    if (!title?.trim()) return;
    try {
      const { data } = await ticketsApi.create({ title: title.trim(), status: column.id });
      dispatch({ type: 'ADD_TICKET', payload: data });
    } catch {
      alert('Ticket konnte nicht erstellt werden');
    }
  }

  return (
    <div className={`flex flex-col w-72 flex-shrink-0 rounded-xl border-t-4 ${column.color} ${column.headerColor}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-700">{column.label}</h2>
          <span className="bg-gray-200 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
            {tickets.length}
          </span>
        </div>
        <button
          onClick={handleAddTicket}
          className="text-gray-400 hover:text-gray-600 hover:bg-white rounded p-0.5 transition-colors"
          title="Ticket hinzufügen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 px-2 pb-2 min-h-[100px] rounded-b-xl transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {tickets.map((ticket, index) => (
              <TicketCard key={ticket.id} ticket={ticket} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

import { Draggable } from '@hello-pangea/dnd';
import { Ticket, PRIORITY_STYLES } from '../../types';
import { useBoardContext } from '../../context/BoardContext';

interface Props {
  ticket: Ticket;
  index: number;
}

export function TicketCard({ ticket, index }: Props) {
  const { dispatch } = useBoardContext();
  const priority = PRIORITY_STYLES[ticket.priority];

  function getInitials(name: string) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <Draggable draggableId={String(ticket.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => dispatch({ type: 'SELECT_TICKET', ticketId: ticket.id })}
          className={`
            bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-pointer
            hover:border-blue-300 hover:shadow-sm transition-all
            ${snapshot.isDragging ? 'shadow-lg rotate-1 border-blue-400' : ''}
          `}
        >
          {/* Labels */}
          {ticket.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {ticket.labels.slice(0, 3).map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
              {ticket.labels.length > 3 && (
                <span className="text-xs text-gray-400">+{ticket.labels.length - 3}</span>
              )}
            </div>
          )}

          {/* Title */}
          <p className="text-sm font-medium text-gray-900 leading-snug mb-2">
            {ticket.title}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {ticket.assignee && (
              <div
                className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold"
                title={ticket.assignee.name}
              >
                {getInitials(ticket.assignee.name)}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

import { useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Column } from './Column';
import { useBoardContext } from '../../context/BoardContext';
import { ticketsApi } from '../../api/tickets';
import { Ticket, Status, COLUMNS } from '../../types';

export function Board() {
  const { tickets, loading, error, dispatch } = useBoardContext();

  const columnMap = COLUMNS.reduce<Record<Status, Ticket[]>>((acc, col) => {
    acc[col.id] = tickets
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.position - b.position);
    return acc;
  }, {} as Record<Status, Ticket[]>);

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result;
      if (!destination) return;
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      )
        return;

      const ticketId = Number(draggableId);
      const newStatus = destination.droppableId as Status;

      // Get destination column tickets (excluding the dragged ticket itself)
      const destTickets = columnMap[newStatus].filter((t) => t.id !== ticketId);

      const prev = destTickets[destination.index - 1];
      const next = destTickets[destination.index];

      let newPosition: number;
      if (!prev && !next) newPosition = 1000;
      else if (!prev) newPosition = next.position / 2;
      else if (!next) newPosition = prev.position + 1000;
      else newPosition = (prev.position + next.position) / 2;

      const snapshot = [...tickets];

      dispatch({
        type: 'MOVE_TICKET_OPTIMISTIC',
        ticketId,
        status: newStatus,
        position: newPosition,
      });

      ticketsApi
        .move(ticketId, newStatus, newPosition)
        .then(({ data }) => dispatch({ type: 'MOVE_TICKET_CONFIRM', ticket: data }))
        .catch(() => {
          dispatch({ type: 'MOVE_TICKET_ROLLBACK', previousTickets: snapshot });
        });
    },
    [tickets, columnMap, dispatch]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 pt-2">
        {COLUMNS.map((col) => (
          <Column key={col.id} column={col} tickets={columnMap[col.id]} />
        ))}
      </div>
    </DragDropContext>
  );
}

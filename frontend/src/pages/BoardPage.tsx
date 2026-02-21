import { Board } from '../components/board/Board';
import { Navbar } from '../components/layout/Navbar';
import { TicketModal } from '../components/ticket/TicketModal';
import { BoardProvider } from '../context/BoardContext';

export function BoardPage() {
  return (
    <BoardProvider>
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-auto">
            <Board />
          </div>
        </main>
        <TicketModal />
      </div>
    </BoardProvider>
  );
}

import { DroppableStateSnapshot } from 'react-beautiful-dnd';

export function getDragDropBackgroundColorClassName(
  snapshot: DroppableStateSnapshot
): string {
  return snapshot.isDraggingOver ? 'bg-slate-300' : 'bg-white';
}


declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  // Draggable
  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => React.ReactElement;
  }

  export interface DraggableProvided {
    draggableProps: any;
    dragHandleProps: any;
    innerRef: (element?: HTMLElement | null) => void;
    placeholder?: React.ReactElement;
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    dropAnimation?: {
      duration: number;
      curve: string;
      moveTo: {
        x: number;
        y: number;
      };
    };
    draggingOver?: string;
    combineWith?: string;
    combineTargetFor?: string;
    mode?: string;
  }

  export class Draggable extends React.Component<DraggableProps> {}

  // Droppable
  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: any;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => void;
    droppableProps: {
      'data-rbd-droppable-id': string;
      'data-rbd-droppable-context-id': string;
    };
    placeholder?: React.ReactElement;
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith?: string;
    draggingFromThisWith?: string;
    isUsingPlaceholder: boolean;
  }

  export class Droppable extends React.Component<DroppableProps> {}

  // DragDropContext
  export interface DragDropContextProps {
    onBeforeCapture?: (before: BeforeCapture) => void;
    onBeforeDragStart?: (initial: DragStart) => void;
    onDragStart?: (initial: DragStart, provided: ResponderProvided) => void;
    onDragUpdate?: (update: DragUpdate, provided: ResponderProvided) => void;
    onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
    children: React.ReactNode;
  }

  export interface BeforeCapture {
    draggableId: string;
    mode: string;
  }

  export interface DragStart {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: string;
  }

  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string;
      index: number;
    };
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }

  export interface DropResult extends DragUpdate {
    reason: 'DROP' | 'CANCEL';
  }

  export interface ResponderProvided {
    announce: {
      (message: string): void;
    };
  }

  export class DragDropContext extends React.Component<DragDropContextProps> {}
}

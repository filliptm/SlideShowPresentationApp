import React, { useState, useRef, useEffect } from 'react';
import { ElementPosition } from '../types/index';
import './DraggableElement.css';

interface DraggableElementProps {
  elementId: string;
  position: ElementPosition;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (position: ElementPosition) => void;
  onDelete: () => void;
  children: React.ReactNode;
  lockAspectRatio?: boolean;
  isEditing?: boolean;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se' | null;

export const DraggableElement: React.FC<DraggableElementProps> = ({
  elementId,
  position,
  isSelected,
  onSelect,
  onPositionChange,
  onDelete,
  children,
  lockAspectRatio = false,
  isEditing = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState<ElementPosition>(position);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Calculate aspect ratio when component mounts
  useEffect(() => {
    if (lockAspectRatio && position.width && position.height) {
      setAspectRatio(position.width / position.height);
    }
  }, [lockAspectRatio, position.width, position.height]);

  const handleMouseDown = (e: React.MouseEvent, handle?: ResizeHandle) => {
    // Disable dragging/resizing while editing
    if (isEditing) {
      e.stopPropagation();
      return;
    }

    e.stopPropagation();

    if (!isSelected) {
      onSelect();
      return;
    }

    if (handle) {
      // Resizing
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      // Dragging
      setIsDragging(true);
    }

    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPosition(position);
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return;

      const container = elementRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const deltaX = ((e.clientX - dragStart.x) / containerRect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / containerRect.height) * 100;

      if (isDragging) {
        // Calculate new position
        let newX = initialPosition.x + deltaX;
        let newY = initialPosition.y + deltaY;

        // Constrain to bounds
        newX = Math.max(0, Math.min(100 - initialPosition.width, newX));
        newY = Math.max(0, Math.min(100 - initialPosition.height, newY));

        onPositionChange({
          ...initialPosition,
          x: newX,
          y: newY,
        });
      } else if (isResizing && resizeHandle) {
        let newPos = { ...initialPosition };

        // Handle different resize directions
        if (resizeHandle.includes('n')) {
          newPos.y = initialPosition.y + deltaY;
          newPos.height = initialPosition.height - deltaY;
        }
        if (resizeHandle.includes('s')) {
          newPos.height = initialPosition.height + deltaY;
        }
        if (resizeHandle.includes('w')) {
          newPos.x = initialPosition.x + deltaX;
          newPos.width = initialPosition.width - deltaX;
        }
        if (resizeHandle.includes('e')) {
          newPos.width = initialPosition.width + deltaX;
        }

        // Lock aspect ratio if enabled
        if (lockAspectRatio && aspectRatio) {
          if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
            // Width changed, adjust height
            newPos.height = newPos.width / aspectRatio;
          } else if (resizeHandle.includes('n') || resizeHandle.includes('s')) {
            // Height changed, adjust width
            newPos.width = newPos.height * aspectRatio;
          } else {
            // Corner handle - maintain aspect ratio based on width
            newPos.height = newPos.width / aspectRatio;
          }
        }

        // Constrain minimum size
        newPos.width = Math.max(5, newPos.width);
        newPos.height = Math.max(5, newPos.height);

        // Constrain to bounds
        newPos.x = Math.max(0, Math.min(100 - newPos.width, newPos.x));
        newPos.y = Math.max(0, Math.min(100 - newPos.height, newPos.y));
        newPos.width = Math.min(100 - newPos.x, newPos.width);
        newPos.height = Math.min(100 - newPos.y, newPos.height);

        onPositionChange(newPos);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, dragStart, initialPosition, onPositionChange, lockAspectRatio, aspectRatio]);

  // Handle keyboard events
  useEffect(() => {
    if (!isSelected || isEditing) return; // Don't handle delete when editing

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only delete if not focused on an input/contenteditable
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDelete();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSelected, isEditing, onDelete]);

  return (
    <div
      ref={elementRef}
      className={`draggable-element ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isResizing ? 'resizing' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
      }}
      onMouseDown={(e) => handleMouseDown(e)}
    >
      <div className="element-content">
        {children}
      </div>

      {isSelected && !isEditing && (
        <>
          <div className="selection-outline" />

          {/* Resize handles */}
          <div className="resize-handle nw" onMouseDown={(e) => handleMouseDown(e, 'nw')} />
          <div className="resize-handle n" onMouseDown={(e) => handleMouseDown(e, 'n')} />
          <div className="resize-handle ne" onMouseDown={(e) => handleMouseDown(e, 'ne')} />
          <div className="resize-handle w" onMouseDown={(e) => handleMouseDown(e, 'w')} />
          <div className="resize-handle e" onMouseDown={(e) => handleMouseDown(e, 'e')} />
          <div className="resize-handle sw" onMouseDown={(e) => handleMouseDown(e, 'sw')} />
          <div className="resize-handle s" onMouseDown={(e) => handleMouseDown(e, 's')} />
          <div className="resize-handle se" onMouseDown={(e) => handleMouseDown(e, 'se')} />

          {/* Delete button */}
          <button
            className="delete-handle"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </button>
        </>
      )}
    </div>
  );
};

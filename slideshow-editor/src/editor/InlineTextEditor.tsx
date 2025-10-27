import React, { useRef, useEffect, useState } from 'react';
import './InlineTextEditor.css';

interface InlineTextEditorProps {
  content: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: string;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  lineHeight?: number;
  letterSpacing?: number;
  onChange: (content: string) => void;
  onBlur: () => void;
}

export const InlineTextEditor: React.FC<InlineTextEditorProps> = ({
  content,
  fontSize,
  color,
  textAlign,
  fontWeight,
  fontFamily,
  fontStyle,
  textDecoration,
  lineHeight,
  letterSpacing,
  onChange,
  onBlur,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const initialFocusDone = useRef(false);

  useEffect(() => {
    if (editorRef.current && !initialFocusDone.current) {
      initialFocusDone.current = true;

      // Set initial content
      editorRef.current.textContent = content;

      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (!editorRef.current) return;

        editorRef.current.focus();

        // Place cursor at end
        try {
          const range = document.createRange();
          const selection = window.getSelection();

          if (editorRef.current.childNodes.length > 0) {
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
          } else {
            // If empty, place cursor inside
            range.setStart(editorRef.current, 0);
            range.setEnd(editorRef.current, 0);
          }

          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          console.warn('Failed to set cursor position:', e);
        }
      }, 10);
    }
  }, [content]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.textContent || '';
    onChange(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onBlur();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onBlur();
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on the toolbar
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && relatedTarget.closest('.text-formatting-toolbar')) {
      return;
    }
    onBlur();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging while editing
    e.stopPropagation();
  };

  return (
    <div
      ref={editorRef}
      className="inline-text-editor"
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseDown={handleMouseDown}
      style={{
        fontSize: `${fontSize || 2}rem`,
        color: color || '#ffffff',
        textAlign: textAlign || 'left',
        fontWeight: fontWeight || 'normal',
        fontFamily: fontFamily || 'inherit',
        fontStyle: fontStyle || 'normal',
        textDecoration: textDecoration || 'none',
        lineHeight: lineHeight || 1.5,
        letterSpacing: letterSpacing ? `${letterSpacing}rem` : 'normal',
      }}
    />
  );
};

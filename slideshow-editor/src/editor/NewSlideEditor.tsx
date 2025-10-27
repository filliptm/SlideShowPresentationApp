import React, { useState } from 'react';
import { Presentation, Slide } from '../types/index';
import { ProjectManager } from '../core/ProjectManager';
import { CanvasSlideEditor } from './CanvasSlideEditor';
import './NewSlideEditor.css';

interface SlideEditorProps {
  presentation: Presentation;
  onUpdate: (presentation: Presentation) => void;
  onPlay: () => void;
}

export const NewSlideEditor: React.FC<SlideEditorProps> = ({ presentation, onUpdate, onPlay }) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [editingSlideNameIndex, setEditingSlideNameIndex] = useState<number | null>(null);

  // Ensure all slides have elements array (migration from old format)
  const ensureSlideFormat = (slide: any): Slide => {
    if (!slide.elements) {
      return {
        id: slide.id,
        type: 'canvas',
        elements: [],
        background: slide.background || '#1a1a1a',
      };
    }
    return slide as Slide;
  };

  const normalizedPresentation = {
    ...presentation,
    slides: presentation.slides.map(ensureSlideFormat),
  };

  const selectedSlide = normalizedPresentation.slides[selectedSlideIndex];

  const addSlide = () => {
    const newSlide = ProjectManager.createSlide();

    // Copy background settings from existing slides if any exist
    if (normalizedPresentation.slides.length > 0) {
      const referenceSlide = normalizedPresentation.slides[0];
      newSlide.background = referenceSlide.background;
      newSlide.backgroundImage = referenceSlide.backgroundImage;
    }

    const updated = {
      ...normalizedPresentation,
      slides: [...normalizedPresentation.slides, newSlide],
    };
    onUpdate(updated);
    setSelectedSlideIndex(normalizedPresentation.slides.length);
  };

  const deleteSlide = (index: number) => {
    if (!confirm('Delete this slide?')) return;

    const updated = {
      ...normalizedPresentation,
      slides: normalizedPresentation.slides.filter((_, i) => i !== index),
    };
    onUpdate(updated);
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= normalizedPresentation.slides.length) return;

    const slides = [...normalizedPresentation.slides];
    [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];

    onUpdate({ ...normalizedPresentation, slides });
    setSelectedSlideIndex(newIndex);
  };

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = normalizedPresentation.slides[index];
    const duplicated: Slide = {
      ...slideToDuplicate,
      id: `slide-${Date.now()}`,
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
      })),
    };

    const slides = [...normalizedPresentation.slides];
    slides.splice(index + 1, 0, duplicated);

    onUpdate({ ...normalizedPresentation, slides });
    setSelectedSlideIndex(index + 1);
  };

  const updateSlide = (slide: Slide) => {
    const slides = [...normalizedPresentation.slides];
    slides[selectedSlideIndex] = slide;
    onUpdate({ ...normalizedPresentation, slides });
  };

  const updateAllSlidesBackground = (color: string) => {
    const slides = normalizedPresentation.slides.map(slide => ({
      ...slide,
      background: color,
    }));
    onUpdate({ ...normalizedPresentation, slides });
  };

  const updateAllSlidesBackgroundImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await ProjectManager.uploadMedia(normalizedPresentation.id, file);
      const imageUrl = `http://localhost:3001${result.path}`;

      const slides = normalizedPresentation.slides.map(slide => ({
        ...slide,
        backgroundImage: imageUrl,
      }));
      onUpdate({ ...normalizedPresentation, slides });
    } catch (error) {
      console.error('Failed to upload background image:', error);
      alert('Failed to upload background image');
    }

    // Reset input
    e.target.value = '';
  };

  const removeAllBackgroundImages = () => {
    const slides = normalizedPresentation.slides.map(slide => ({
      ...slide,
      backgroundImage: undefined,
    }));
    onUpdate({ ...normalizedPresentation, slides });
  };

  const renameSlideName = (index: number, newName: string) => {
    const slides = [...normalizedPresentation.slides];
    slides[index] = { ...slides[index], name: newName };
    onUpdate({ ...normalizedPresentation, slides });
  };

  const handlePlay = () => {
    onPlay();
    // Request fullscreen after play is initiated
    setTimeout(() => {
      document.documentElement.requestFullscreen?.();
    }, 100);
  };

  return (
    <div className="new-slide-editor">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{presentation.name}</h2>
          <button onClick={handlePlay} className="play-btn">▶ Play</button>
        </div>

        <div className="slide-list">
          {normalizedPresentation.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-item ${index === selectedSlideIndex ? 'selected' : ''}`}
              onClick={() => setSelectedSlideIndex(index)}
            >
              <div className="slide-preview">
                <span className="slide-number">{index + 1}</span>
                {editingSlideNameIndex === index ? (
                  <input
                    type="text"
                    className="slide-name-input"
                    defaultValue={slide.name || `Slide ${index + 1}`}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                      renameSlideName(index, e.target.value);
                      setEditingSlideNameIndex(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        renameSlideName(index, e.currentTarget.value);
                        setEditingSlideNameIndex(null);
                      } else if (e.key === 'Escape') {
                        setEditingSlideNameIndex(null);
                      }
                    }}
                  />
                ) : (
                  <span
                    className="slide-name"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingSlideNameIndex(index);
                    }}
                  >
                    {slide.name || `Slide ${index + 1}`}
                  </span>
                )}
                <span className="slide-info">{slide.elements.length} elements</span>
              </div>
              <div className="slide-actions">
                {index > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }} title="Move up">
                    ↑
                  </button>
                )}
                {index < normalizedPresentation.slides.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }} title="Move down">
                    ↓
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); duplicateSlide(index); }} title="Duplicate">
                  ⎘
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }} title="Delete">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-slide-buttons">
          <button onClick={addSlide}>+ Add Slide</button>
        </div>

        <div className="slide-settings">
          <h3>All Slides Settings</h3>
          <div className="setting-group">
            <label>Background Color (All Slides)</label>
            <input
              type="color"
              value={selectedSlide?.background || '#1a1a1a'}
              onChange={(e) => updateAllSlidesBackground(e.target.value)}
            />
          </div>
          <div className="setting-group">
            <label>Background Image (All Slides)</label>
            <input
              type="file"
              accept="image/*"
              onChange={updateAllSlidesBackgroundImage}
              style={{ fontSize: '0.75rem' }}
            />
            {selectedSlide?.backgroundImage && (
              <button onClick={removeAllBackgroundImages} className="remove-bg-btn">
                Remove Image from All Slides
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="editor-main">
        {selectedSlide ? (
          <CanvasSlideEditor
            slide={selectedSlide}
            presentationId={normalizedPresentation.id}
            onUpdate={updateSlide}
          />
        ) : (
          <div className="no-slide-selected">
            <p>Create a slide to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

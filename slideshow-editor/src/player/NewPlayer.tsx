import React, { useState, useEffect, useCallback } from 'react';
import { Presentation, TextElement, ImageElement, VideoElement } from '../types/index';
import './NewPlayer.css';

interface PlayerProps {
  presentation: Presentation;
  onExit: () => void;
}

export const NewPlayer: React.FC<PlayerProps> = ({ presentation, onExit }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) =>
      prev < presentation.slides.length - 1 ? prev + 1 : prev
    );
  }, [presentation.slides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'PageDown':
          e.preventDefault();
          goToNextSlide();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goToPrevSlide();
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlideIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlideIndex(presentation.slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, onExit, presentation.slides.length]);

  const currentSlide = presentation.slides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <div className="player-fullscreen">
        <div className="no-slides">
          <p>No slides in this presentation</p>
          <button onClick={onExit}>Exit (ESC)</button>
        </div>
      </div>
    );
  }

  return (
    <div className="player-fullscreen">
      <div
        className="player-slide"
        style={{
          background: currentSlide.background || '#1a1a1a',
          backgroundImage: currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="player-canvas">
          {currentSlide.elements
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((element) => (
              <div
                key={element.id}
                className="player-element"
                style={{
                  left: `${element.position.x}%`,
                  top: `${element.position.y}%`,
                  width: `${element.position.width}%`,
                  height: `${element.position.height}%`,
                }}
              >
                {element.type === 'text' && (
                  <div
                    className="player-text-element"
                    style={{
                      fontSize: `${(element as TextElement).fontSize || 2}rem`,
                      textAlign: (element as TextElement).textAlign || 'left',
                      color: (element as TextElement).color || '#ffffff',
                      fontWeight: (element as TextElement).fontWeight || 'normal',
                      fontFamily: (element as TextElement).fontFamily || 'inherit',
                      fontStyle: (element as TextElement).fontStyle || 'normal',
                      textDecoration: (element as TextElement).textDecoration || 'none',
                      lineHeight: (element as TextElement).lineHeight || 1.5,
                      letterSpacing: (element as TextElement).letterSpacing ? `${(element as TextElement).letterSpacing}rem` : 'normal',
                      textTransform: (element as TextElement).textTransform || 'none',
                      backgroundColor: (element as TextElement).backgroundColor || 'transparent',
                      opacity: (element as TextElement).opacity ?? 1,
                      textShadow: (element as TextElement).textShadow || 'none',
                    }}
                  >
                    {(element as TextElement).content}
                  </div>
                )}

                {element.type === 'image' && (
                  <img
                    src={(element as ImageElement).src}
                    alt={(element as ImageElement).alt || ''}
                    className="player-image-element"
                  />
                )}

                {element.type === 'video' && (
                  <video
                    src={(element as VideoElement).src}
                    className="player-video-element"
                    controls
                    autoPlay
                  />
                )}
              </div>
            ))}
        </div>
      </div>

      <div className="player-controls">
        <button onClick={goToPrevSlide} disabled={currentSlideIndex === 0}>
          ← Previous
        </button>
        <span className="slide-counter">
          {currentSlideIndex + 1} / {presentation.slides.length}
        </span>
        <button
          onClick={goToNextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
        >
          Next →
        </button>
        <button onClick={onExit} className="exit-btn">
          Exit (ESC)
        </button>
      </div>

      <div className="keyboard-hint">
        Use arrow keys, space, or buttons to navigate
      </div>
    </div>
  );
};

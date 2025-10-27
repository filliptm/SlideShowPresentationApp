import React, { useState, useEffect, useCallback } from 'react';
import { Presentation, Slide, ContentSlideContent, TitleSlideContent } from '../types/index';
import './Player.css';

interface PlayerProps {
  presentation: Presentation;
  onExit: () => void;
}

export const Player: React.FC<PlayerProps> = ({ presentation, onExit }) => {
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
      <div className="player-slide" style={{ background: currentSlide.background || '#1a1a1a' }}>
        {currentSlide.type === 'title' && (
          <TitleSlideView content={currentSlide.content as TitleSlideContent} />
        )}
        {currentSlide.type === 'content' && (
          <ContentSlideView content={currentSlide.content as ContentSlideContent} />
        )}
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

const TitleSlideView: React.FC<{ content: TitleSlideContent }> = ({ content }) => (
  <div className="title-slide-view">
    <h1>{content.title}</h1>
    {content.subtitle && <h2>{content.subtitle}</h2>}
  </div>
);

const ContentSlideView: React.FC<{ content: ContentSlideContent }> = ({ content }) => {
  const layout = content.layout || 'text-only';

  const renderText = () => (
    <div className="slide-text">
      <pre>{content.text}</pre>
    </div>
  );

  const renderMedia = () => {
    if (!content.media) return null;

    return (
      <div className="slide-media">
        {content.media.type === 'image' ? (
          <img src={content.media.src} alt={content.media.alt || ''} />
        ) : (
          <video src={content.media.src} controls autoPlay />
        )}
      </div>
    );
  };

  if (layout === 'text-only') {
    return <div className="content-layout-text">{renderText()}</div>;
  }

  if (layout === 'media-only') {
    return <div className="content-layout-media">{renderMedia()}</div>;
  }

  if (layout === 'text-left') {
    return (
      <div className="content-layout-split">
        {renderText()}
        {renderMedia()}
      </div>
    );
  }

  if (layout === 'text-right') {
    return (
      <div className="content-layout-split">
        {renderMedia()}
        {renderText()}
      </div>
    );
  }

  return null;
};

import React, { useState } from 'react';
import { Presentation, Slide, ContentSlideContent, TitleSlideContent } from '../types/index';
import { ProjectManager } from '../core/ProjectManager';
import './SlideEditor.css';

interface SlideEditorProps {
  presentation: Presentation;
  onUpdate: (presentation: Presentation) => void;
  onPlay: () => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({ presentation, onUpdate, onPlay }) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  const selectedSlide = presentation.slides[selectedSlideIndex];

  const addSlide = (type: Slide['type']) => {
    const newSlide = ProjectManager.createSlide(type);
    const updated = {
      ...presentation,
      slides: [...presentation.slides, newSlide],
    };
    onUpdate(updated);
    setSelectedSlideIndex(presentation.slides.length);
  };

  const deleteSlide = (index: number) => {
    const updated = {
      ...presentation,
      slides: presentation.slides.filter((_, i) => i !== index),
    };
    onUpdate(updated);
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= presentation.slides.length) return;

    const slides = [...presentation.slides];
    [slides[index], slides[newIndex]] = [slides[newIndex], slides[index]];

    onUpdate({ ...presentation, slides });
    setSelectedSlideIndex(newIndex);
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const slides = [...presentation.slides];
    slides[index] = { ...slides[index], ...updates };
    onUpdate({ ...presentation, slides });
  };

  const updateSlideContent = (index: number, content: Partial<TitleSlideContent | ContentSlideContent>) => {
    const slide = presentation.slides[index];
    updateSlide(index, {
      content: { ...slide.content, ...content },
    });
  };

  return (
    <div className="slide-editor">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{presentation.name}</h2>
          <button onClick={onPlay} className="play-btn">▶ Play</button>
        </div>

        <div className="slide-list">
          {presentation.slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide-item ${index === selectedSlideIndex ? 'selected' : ''}`}
              onClick={() => setSelectedSlideIndex(index)}
            >
              <div className="slide-preview">
                <span className="slide-number">{index + 1}</span>
                <span className="slide-type">{slide.type}</span>
              </div>
              <div className="slide-actions">
                {index > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(index, 'up'); }}>↑</button>
                )}
                {index < presentation.slides.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); moveSlide(index, 'down'); }}>↓</button>
                )}
                <button onClick={(e) => { e.stopPropagation(); deleteSlide(index); }}>×</button>
              </div>
            </div>
          ))}
        </div>

        <div className="add-slide-buttons">
          <button onClick={() => addSlide('title')}>+ Title Slide</button>
          <button onClick={() => addSlide('content')}>+ Content Slide</button>
        </div>
      </div>

      <div className="editor-main">
        {selectedSlide ? (
          <SlidePropertiesPanel
            slide={selectedSlide}
            presentationId={presentation.id}
            onUpdate={(updates) => updateSlide(selectedSlideIndex, updates)}
            onContentUpdate={(content) => updateSlideContent(selectedSlideIndex, content)}
          />
        ) : (
          <div className="no-slide-selected">
            <p>Create a slide to get started</p>
          </div>
        )}
      </div>

      <div className="preview-panel">
        {selectedSlide && <SlidePreview slide={selectedSlide} />}
      </div>
    </div>
  );
};

interface SlidePropertiesPanelProps {
  slide: Slide;
  presentationId: string;
  onUpdate: (updates: Partial<Slide>) => void;
  onContentUpdate: (content: Partial<TitleSlideContent | ContentSlideContent>) => void;
}

const SlidePropertiesPanel: React.FC<SlidePropertiesPanelProps> = ({ slide, presentationId, onUpdate, onContentUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload file to backend
      const result = await ProjectManager.uploadMedia(presentationId, file);

      // Get current content
      const content = slide.content as ContentSlideContent;

      // Auto-update layout if it's text-only (so media will be visible)
      const layout = content.layout === 'text-only' ? 'text-left' : content.layout;

      // Update slide with the backend URL and layout
      onContentUpdate({
        media: { type: result.type, src: `http://localhost:3001${result.path}` },
        layout,
      } as Partial<ContentSlideContent>);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload media file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="properties-panel">
      <h3>Slide Properties</h3>

      <div className="property-group">
        <label>Background Color</label>
        <input
          type="color"
          value={slide.background || '#1a1a1a'}
          onChange={(e) => onUpdate({ background: e.target.value })}
        />
      </div>

      {slide.type === 'title' && (
        <TitleSlideProperties
          content={slide.content as TitleSlideContent}
          onUpdate={onContentUpdate}
        />
      )}

      {slide.type === 'content' && (
        <ContentSlideProperties
          content={slide.content as ContentSlideContent}
          onUpdate={onContentUpdate}
          onMediaUpload={handleMediaUpload}
          uploading={uploading}
        />
      )}
    </div>
  );
};

const TitleSlideProperties: React.FC<{
  content: TitleSlideContent;
  onUpdate: (content: Partial<TitleSlideContent>) => void;
}> = ({ content, onUpdate }) => (
  <>
    <div className="property-group">
      <label>Title</label>
      <input
        type="text"
        value={content.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
    </div>
    <div className="property-group">
      <label>Subtitle</label>
      <input
        type="text"
        value={content.subtitle || ''}
        onChange={(e) => onUpdate({ subtitle: e.target.value })}
      />
    </div>
  </>
);

const ContentSlideProperties: React.FC<{
  content: ContentSlideContent;
  onUpdate: (content: Partial<ContentSlideContent>) => void;
  onMediaUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
}> = ({ content, onUpdate, onMediaUpload, uploading }) => (
  <>
    <div className="property-group">
      <label>Layout</label>
      <select
        value={content.layout || 'text-only'}
        onChange={(e) => onUpdate({ layout: e.target.value as ContentSlideContent['layout'] })}
      >
        <option value="text-only">Text Only</option>
        <option value="media-only">Media Only</option>
        <option value="text-left">Text Left, Media Right</option>
        <option value="text-right">Text Right, Media Left</option>
      </select>
    </div>

    <div className="property-group">
      <label>Text Content</label>
      <textarea
        value={content.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        rows={10}
      />
    </div>

    <div className="property-group">
      <label>Media {uploading && '(Uploading...)'}</label>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={onMediaUpload}
        disabled={uploading}
      />
      {content.media && (
        <div className="media-info">
          <p>Type: {content.media.type}</p>
          <button onClick={() => onUpdate({ media: undefined })}>Remove Media</button>
        </div>
      )}
    </div>
  </>
);

const SlidePreview: React.FC<{ slide: Slide }> = ({ slide }) => {
  return (
    <div className="slide-preview-container" style={{ background: slide.background || '#1a1a1a' }}>
      {slide.type === 'title' && (
        <div className="title-slide-preview">
          <h1>{(slide.content as TitleSlideContent).title}</h1>
          {(slide.content as TitleSlideContent).subtitle && (
            <h2>{(slide.content as TitleSlideContent).subtitle}</h2>
          )}
        </div>
      )}

      {slide.type === 'content' && (
        <ContentSlidePreview content={slide.content as ContentSlideContent} />
      )}
    </div>
  );
};

const ContentSlidePreview: React.FC<{ content: ContentSlideContent }> = ({ content }) => {
  const layout = content.layout || 'text-only';

  const renderText = () => (
    <div className="content-text">
      <pre>{content.text}</pre>
    </div>
  );

  const renderMedia = () => {
    if (!content.media) return null;

    return (
      <div className="content-media">
        {content.media.type === 'image' ? (
          <img src={content.media.src} alt={content.media.alt || ''} />
        ) : (
          <video src={content.media.src} controls />
        )}
      </div>
    );
  };

  if (layout === 'text-only') {
    return <div className="layout-text-only">{renderText()}</div>;
  }

  if (layout === 'media-only') {
    return <div className="layout-media-only">{renderMedia()}</div>;
  }

  if (layout === 'text-left') {
    return (
      <div className="layout-split">
        {renderText()}
        {renderMedia()}
      </div>
    );
  }

  if (layout === 'text-right') {
    return (
      <div className="layout-split">
        {renderMedia()}
        {renderText()}
      </div>
    );
  }

  return null;
};

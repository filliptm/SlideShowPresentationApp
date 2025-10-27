import React, { useState, useEffect } from 'react';
import { Slide, SlideElement, TextElement, ImageElement, VideoElement, ElementPosition } from '../types/index';
import { DraggableElement } from './DraggableElement';
import { ProjectManager } from '../core/ProjectManager';
import { InlineTextEditor } from './InlineTextEditor';
import { TextFormattingToolbar } from './TextFormattingToolbar';
import { loadGoogleFont } from '../utils/fontLoader';
import './CanvasSlideEditor.css';

interface CanvasSlideEditorProps {
  slide: Slide;
  presentationId: string;
  onUpdate: (slide: Slide) => void;
}

export const CanvasSlideEditor: React.FC<CanvasSlideEditorProps> = ({
  slide,
  presentationId,
  onUpdate,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load fonts for all text elements on mount
  useEffect(() => {
    slide.elements.forEach((element) => {
      if (element.type === 'text') {
        const textElement = element as TextElement;
        if (textElement.fontFamily) {
          loadGoogleFont(textElement.fontFamily);
        }
      }
    });
  }, [slide.elements]);

  const addTextElement = () => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Double click to edit text',
      position: {
        x: 25,
        y: 25,
        width: 50,
        height: 15,
      },
      zIndex: getMaxZIndex() + 1,
      fontSize: 2,
      textAlign: 'left',
      color: '#ffffff',
    };

    onUpdate({
      ...slide,
      elements: [...slide.elements, newElement],
    });
    setSelectedElementId(newElement.id);
  };

  const addImageElement = async (file: File) => {
    setUploading(true);
    try {
      const result = await ProjectManager.uploadMedia(presentationId, file);

      // Load image to get natural dimensions
      const img = new Image();
      img.src = `http://localhost:3001${result.path}`;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Calculate aspect ratio and size
      // Slide canvas is 16:9 aspect ratio
      const canvasAspectRatio = 16 / 9;
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;

      const baseWidth = 40; // 40% of slide width
      // Convert to actual dimensions considering canvas aspect ratio
      const calculatedHeight = (baseWidth / imageAspectRatio) * canvasAspectRatio;

      const newElement: ImageElement = {
        id: `image-${Date.now()}`,
        type: 'image',
        src: `http://localhost:3001${result.path}`,
        position: {
          x: 25,
          y: 25,
          width: baseWidth,
          height: calculatedHeight,
        },
        zIndex: getMaxZIndex() + 1,
        lockAspectRatio: true,
      };

      onUpdate({
        ...slide,
        elements: [...slide.elements, newElement],
      });
      setSelectedElementId(newElement.id);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addVideoElement = async (file: File) => {
    setUploading(true);
    try {
      const result = await ProjectManager.uploadMedia(presentationId, file);

      // Load video to get natural dimensions
      const video = document.createElement('video');
      video.src = `http://localhost:3001${result.path}`;

      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Calculate aspect ratio and size
      // Slide canvas is 16:9 aspect ratio
      const canvasAspectRatio = 16 / 9;
      const videoAspectRatio = video.videoWidth / video.videoHeight;

      const baseWidth = 50; // 50% of slide width
      // Convert to actual dimensions considering canvas aspect ratio
      const calculatedHeight = (baseWidth / videoAspectRatio) * canvasAspectRatio;

      const newElement: VideoElement = {
        id: `video-${Date.now()}`,
        type: 'video',
        src: `http://localhost:3001${result.path}`,
        position: {
          x: 20,
          y: 20,
          width: baseWidth,
          height: calculatedHeight,
        },
        zIndex: getMaxZIndex() + 1,
        lockAspectRatio: true,
      };

      onUpdate({
        ...slide,
        elements: [...slide.elements, newElement],
      });
      setSelectedElementId(newElement.id);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      await addImageElement(file);
    } else if (file.type.startsWith('video/')) {
      await addVideoElement(file);
    }

    // Reset input
    e.target.value = '';
  };

  const getMaxZIndex = (): number => {
    if (slide.elements.length === 0) return 0;
    return Math.max(...slide.elements.map(el => el.zIndex));
  };

  const updateElement = (elementId: string, updates: Partial<SlideElement>) => {
    onUpdate({
      ...slide,
      elements: slide.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    });
  };

  const updateElementPosition = (elementId: string, position: ElementPosition) => {
    updateElement(elementId, { position });
  };

  const deleteElement = (elementId: string) => {
    onUpdate({
      ...slide,
      elements: slide.elements.filter(el => el.id !== elementId),
    });
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const bringToFront = (elementId: string) => {
    const maxZ = getMaxZIndex();
    updateElement(elementId, { zIndex: maxZ + 1 });
  };

  const sendToBack = (elementId: string) => {
    const minZ = Math.min(...slide.elements.map(el => el.zIndex));
    updateElement(elementId, { zIndex: minZ - 1 });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  };

  const handleTextEdit = (elementId: string) => {
    setEditingElementId(elementId);
  };

  const handleTextChange = (elementId: string, newContent: string) => {
    updateElement(elementId, { content: newContent });
  };

  const handleTextBlur = () => {
    setEditingElementId(null);
  };

  const selectedElement = slide.elements.find(el => el.id === selectedElementId);

  return (
    <div className="canvas-slide-editor">
      <div className="editor-toolbar">
        <button onClick={addTextElement} className="toolbar-btn">
          + Add Text
        </button>

        <label className="toolbar-btn file-upload-btn">
          + Add Image/Video
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {uploading && <span className="uploading-indicator">Uploading...</span>}

        {selectedElement && (
          <>
            <div className="toolbar-divider" />
            <button onClick={() => bringToFront(selectedElement.id)} className="toolbar-btn-sm">
              ⬆ Front
            </button>
            <button onClick={() => sendToBack(selectedElement.id)} className="toolbar-btn-sm">
              ⬇ Back
            </button>
            {selectedElement.type === 'text' && (
              <button onClick={() => handleTextEdit(selectedElement.id)} className="toolbar-btn-sm">
                ✏ Edit Text
              </button>
            )}
          </>
        )}
      </div>

      {/* Text Formatting Toolbar */}
      {selectedElement && selectedElement.type === 'text' && !editingElementId && (
        <TextFormattingToolbar
          element={selectedElement as TextElement}
          onUpdate={(updates) => updateElement(selectedElement.id, updates)}
          onClose={() => setSelectedElementId(null)}
        />
      )}

      <div
        className="canvas-container"
        onClick={handleCanvasClick}
        style={{
          background: slide.background || '#1a1a1a',
          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {slide.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <DraggableElement
              key={element.id}
              elementId={element.id}
              position={element.position}
              isSelected={selectedElementId === element.id}
              onSelect={() => setSelectedElementId(element.id)}
              onPositionChange={(pos) => updateElementPosition(element.id, pos)}
              onDelete={() => deleteElement(element.id)}
              lockAspectRatio={element.type !== 'text' && (element as ImageElement | VideoElement).lockAspectRatio}
              isEditing={editingElementId === element.id}
            >
              {element.type === 'text' && (
                editingElementId === element.id ? (
                  <InlineTextEditor
                    content={(element as TextElement).content}
                    fontSize={(element as TextElement).fontSize || 2}
                    color={(element as TextElement).color || '#ffffff'}
                    textAlign={(element as TextElement).textAlign || 'left'}
                    fontWeight={(element as TextElement).fontWeight || 'normal'}
                    fontFamily={(element as TextElement).fontFamily}
                    fontStyle={(element as TextElement).fontStyle}
                    textDecoration={(element as TextElement).textDecoration}
                    lineHeight={(element as TextElement).lineHeight}
                    letterSpacing={(element as TextElement).letterSpacing}
                    onChange={(content) => handleTextChange(element.id, content)}
                    onBlur={handleTextBlur}
                  />
                ) : (
                  <div
                    className="text-element"
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
                    onDoubleClick={() => handleTextEdit(element.id)}
                  >
                    {(element as TextElement).content}
                  </div>
                )
              )}

              {element.type === 'image' && (
                <img
                  src={(element as ImageElement).src}
                  alt={(element as ImageElement).alt || ''}
                  className="image-element"
                  draggable={false}
                />
              )}

              {element.type === 'video' && (
                <video
                  src={(element as VideoElement).src}
                  className="video-element"
                  controls
                />
              )}
            </DraggableElement>
          ))}
      </div>
    </div>
  );
};

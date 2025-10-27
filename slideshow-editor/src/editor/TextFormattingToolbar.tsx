import React, { useState, useEffect } from 'react';
import { TextElement } from '../types/index';
import { loadGoogleFont, GOOGLE_FONTS, WEB_SAFE_FONTS } from '../utils/fontLoader';
import { TEXT_PRESETS } from '../presets/textPresets';
import './TextFormattingToolbar.css';

interface TextFormattingToolbarProps {
  element: TextElement;
  onUpdate: (updates: Partial<TextElement>) => void;
  onClose?: () => void;
}

const FONT_FAMILIES = [...WEB_SAFE_FONTS, ...GOOGLE_FONTS];

export const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({
  element,
  onUpdate,
  onClose,
}) => {
  const [showShadowControls, setShowShadowControls] = useState(false);

  useEffect(() => {
    // Load font when element font changes
    if (element.fontFamily) {
      loadGoogleFont(element.fontFamily);
    }
  }, [element.fontFamily]);

  const toggleBold = () => {
    onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    const current = element.textDecoration || 'none';
    onUpdate({ textDecoration: current === 'underline' ? 'none' : 'underline' });
  };

  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    onUpdate({ textAlign: align });
  };

  const updateTextShadow = (h: number, v: number, blur: number, color: string) => {
    const shadow = `${h}px ${v}px ${blur}px ${color}`;
    onUpdate({ textShadow: shadow });
  };

  const removeTextShadow = () => {
    onUpdate({ textShadow: 'none' });
  };

  const applyPreset = (presetName: string) => {
    const preset = TEXT_PRESETS.find(p => p.name === presetName);
    if (preset) {
      onUpdate(preset.style);
    }
  };

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <div
        className="text-formatting-toolbar-backdrop"
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div
        className="text-formatting-toolbar"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>Text Formatting</h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#aaa',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                lineHeight: '1',
              }}
              title="Close (ESC)"
            >
              ×
            </button>
          )}
        </div>

        {/* Presets */}
      <div className="toolbar-section">
        <label className="toolbar-label">Preset</label>
        <select
          className="toolbar-select-sm"
          onChange={(e) => {
            if (e.target.value) {
              applyPreset(e.target.value);
              e.target.value = ''; // Reset
            }
          }}
          defaultValue=""
        >
          <option value="">Apply Style...</option>
          {TEXT_PRESETS.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-divider" />

      {/* Font Controls */}
      <div className="toolbar-section">
        <label className="toolbar-label">Font</label>
        <select
          className="toolbar-select"
          value={element.fontFamily || 'Arial'}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div className="toolbar-section">
        <label className="toolbar-label">Size</label>
        <input
          type="number"
          className="toolbar-input"
          min="0.5"
          max="10"
          step="0.1"
          value={element.fontSize || 2}
          onChange={(e) => onUpdate({ fontSize: parseFloat(e.target.value) })}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Basic Formatting */}
      <div className="toolbar-section">
        <button
          className={`toolbar-icon-btn ${element.fontWeight === 'bold' ? 'active' : ''}`}
          onClick={toggleBold}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          className={`toolbar-icon-btn ${element.fontStyle === 'italic' ? 'active' : ''}`}
          onClick={toggleItalic}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          className={`toolbar-icon-btn ${element.textDecoration === 'underline' ? 'active' : ''}`}
          onClick={toggleUnderline}
          title="Underline"
        >
          <u>U</u>
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Alignment */}
      <div className="toolbar-section">
        <button
          className={`toolbar-icon-btn ${element.textAlign === 'left' ? 'active' : ''}`}
          onClick={() => setAlignment('left')}
          title="Align Left"
        >
          ⬅
        </button>
        <button
          className={`toolbar-icon-btn ${element.textAlign === 'center' ? 'active' : ''}`}
          onClick={() => setAlignment('center')}
          title="Align Center"
        >
          ↔
        </button>
        <button
          className={`toolbar-icon-btn ${element.textAlign === 'right' ? 'active' : ''}`}
          onClick={() => setAlignment('right')}
          title="Align Right"
        >
          ➡
        </button>
      </div>

      <div className="toolbar-divider" />

      {/* Colors */}
      <div className="toolbar-section">
        <label className="toolbar-label">Text Color</label>
        <input
          type="color"
          className="toolbar-color"
          value={element.color || '#ffffff'}
          onChange={(e) => onUpdate({ color: e.target.value })}
        />
      </div>

      <div className="toolbar-section">
        <label className="toolbar-label">Background</label>
        <input
          type="color"
          className="toolbar-color"
          value={element.backgroundColor || '#00000000'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        />
        {element.backgroundColor && element.backgroundColor !== 'transparent' && (
          <button
            className="toolbar-clear-btn"
            onClick={() => onUpdate({ backgroundColor: 'transparent' })}
            title="Clear Background"
          >
            ✕
          </button>
        )}
      </div>

      <div className="toolbar-divider" />

      {/* Advanced Typography */}
      <div className="toolbar-section">
        <label className="toolbar-label">Line Height</label>
        <input
          type="number"
          className="toolbar-input-sm"
          min="0.8"
          max="3"
          step="0.1"
          value={element.lineHeight || 1.5}
          onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
        />
      </div>

      <div className="toolbar-section">
        <label className="toolbar-label">Letter Spacing</label>
        <input
          type="number"
          className="toolbar-input-sm"
          min="-0.1"
          max="0.5"
          step="0.01"
          value={element.letterSpacing || 0}
          onChange={(e) => onUpdate({ letterSpacing: parseFloat(e.target.value) })}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Text Transform */}
      <div className="toolbar-section">
        <label className="toolbar-label">Transform</label>
        <select
          className="toolbar-select-sm"
          value={element.textTransform || 'none'}
          onChange={(e) => onUpdate({ textTransform: e.target.value as any })}
        >
          <option value="none">None</option>
          <option value="uppercase">UPPERCASE</option>
          <option value="lowercase">lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </div>

      {/* Opacity */}
      <div className="toolbar-section">
        <label className="toolbar-label">Opacity</label>
        <input
          type="number"
          className="toolbar-input-sm"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity ?? 1}
          onChange={(e) => onUpdate({ opacity: parseFloat(e.target.value) })}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Text Shadow */}
      <div className="toolbar-section">
        <button
          className={`toolbar-btn-sm ${element.textShadow && element.textShadow !== 'none' ? 'active' : ''}`}
          onClick={() => setShowShadowControls(!showShadowControls)}
          title="Text Shadow"
        >
          Shadow
        </button>
        {element.textShadow && element.textShadow !== 'none' && (
          <button
            className="toolbar-clear-btn"
            onClick={removeTextShadow}
            title="Remove Shadow"
          >
            ✕
          </button>
        )}
      </div>

      {/* Shadow Controls Popup */}
      {showShadowControls && (
        <>
          <div
            className="shadow-controls-backdrop"
            onClick={() => setShowShadowControls(false)}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div
            className="shadow-controls"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, fontSize: '0.875rem', color: '#fff' }}>Text Shadow</h4>
            <label className="toolbar-label">Horizontal Offset</label>
            <input
              type="range"
              min="-20"
              max="20"
              defaultValue="2"
              onChange={(e) => {
                const h = parseInt(e.target.value);
                updateTextShadow(h, 2, 4, 'rgba(0,0,0,0.5)');
              }}
            />
            <label className="toolbar-label">Vertical Offset</label>
            <input
              type="range"
              min="-20"
              max="20"
              defaultValue="2"
              onChange={(e) => {
                const v = parseInt(e.target.value);
                updateTextShadow(2, v, 4, 'rgba(0,0,0,0.5)');
              }}
            />
            <label className="toolbar-label">Blur Radius</label>
            <input
              type="range"
              min="0"
              max="20"
              defaultValue="4"
              onChange={(e) => {
                const blur = parseInt(e.target.value);
                updateTextShadow(2, 2, blur, 'rgba(0,0,0,0.5)');
              }}
            />
            <button
              className="toolbar-btn-sm"
              onClick={() => setShowShadowControls(false)}
              style={{ marginTop: '0.5rem', width: '100%' }}
            >
              Done
            </button>
          </div>
        </>
      )}
      </div>
    </>
  );
};

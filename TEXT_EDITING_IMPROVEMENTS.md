# Text Editing System Improvements

## Current State Analysis

### Existing Text Features
- Basic text elements with positioning on canvas
- Properties: `content`, `fontSize`, `fontWeight`, `textAlign`, `color`
- Editing via browser `prompt()` dialog
- Double-click or toolbar button to edit
- Drag and resize with corner handles

### Critical Weaknesses
1. **Primitive Editing UX**: Browser `prompt()` doesn't support multiline, formatting preview, or WYSIWYG
2. **Limited Typography**: Only 4 style properties (fontSize, fontWeight, textAlign, color)
3. **No Inline Editing**: Cannot edit text directly on canvas where it appears
4. **No Formatting UI**: No visual controls for text styling
5. **Missing Standard Features**: No bold/italic/underline shortcuts, font selection, advanced typography

---

## Phase 1: Inline Text Editing (High Priority)

### Goal
Replace `prompt()` with direct contentEditable editing on the canvas for WYSIWYG experience.

### Technical Implementation

#### 1.1 Update TextElement Component Rendering
**File**: `/slideshow-editor/src/editor/CanvasSlideEditor.tsx`

- Add `isEditing` state for tracking which text element is being edited
- Replace current text rendering with contentEditable div when in edit mode
- Add edit mode toggle on double-click
- Exit edit mode on blur or Escape key

```typescript
const [editingElementId, setEditingElementId] = useState<string | null>(null);

const handleTextEdit = (elementId: string) => {
  setEditingElementId(elementId);
};

const handleTextChange = (elementId: string, newContent: string) => {
  updateElement(elementId, { content: newContent });
};

const handleTextBlur = () => {
  setEditingElementId(null);
};
```

#### 1.2 Create Inline Text Editor Component
**New File**: `/slideshow-editor/src/editor/InlineTextEditor.tsx`

```typescript
interface InlineTextEditorProps {
  content: string;
  fontSize: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  fontWeight: string;
  onChange: (content: string) => void;
  onBlur: () => void;
}
```

Features:
- ContentEditable div with all text styles applied
- Auto-focus on mount
- Handle Enter key (allow multiline with Shift+Enter, exit on Enter)
- Handle Escape key to cancel/exit
- Preserve cursor position during updates
- Prevent drag/resize while editing

#### 1.3 Update DraggableElement
**File**: `/slideshow-editor/src/editor/DraggableElement.tsx`

- Add `isEditing` prop to disable drag/resize during text editing
- Disable mouse events on element when in edit mode
- Hide resize handles during editing

#### 1.4 Keyboard Shortcuts
- **Double-click**: Enter edit mode
- **Enter**: Exit edit mode and save
- **Shift+Enter**: New line (multiline support)
- **Escape**: Exit edit mode without saving
- **Tab**: Exit current element, select next element

---

## Phase 2: Text Formatting Toolbar (High Priority)

### Goal
Provide visual controls for text styling that appear when text element is selected.

### Technical Implementation

#### 2.1 Create TextFormattingToolbar Component
**New File**: `/slideshow-editor/src/editor/TextFormattingToolbar.tsx`

A contextual toolbar that appears when text element is selected, containing:

**Basic Formatting**:
- Font family dropdown (12-15 common fonts)
- Font size input/slider (0.5rem - 10rem)
- Bold button (toggle fontWeight: normal/bold)
- Italic button (toggle fontStyle: normal/italic)
- Underline button (toggle textDecoration)

**Text Alignment**:
- Left align button
- Center align button
- Right align button
- Justify button (new feature)

**Color Controls**:
- Text color picker
- Background/highlight color picker (new feature)

**Advanced Typography**:
- Line height slider (0.8 - 3.0)
- Letter spacing slider (-0.1rem - 0.5rem)
- Text transform dropdown (none/uppercase/lowercase/capitalize)

#### 2.2 Update TypeScript Interfaces
**File**: `/slideshow-editor/src/types/index.ts`

Add new optional properties to `TextElement`:
```typescript
export interface TextElement extends BaseElement {
  type: 'text';
  content: string;

  // Existing
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;

  // New
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'underline line-through';
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  backgroundColor?: string;
  opacity?: number;
  textShadow?: string;
  textStroke?: {
    width: number;
    color: string;
  };
}
```

#### 2.3 Toolbar Positioning
- Position toolbar above or below selected text element
- Ensure toolbar stays within viewport
- Sticky positioning during scrolling
- Hide when element is deselected

#### 2.4 Integration with Canvas Editor
**File**: `/slideshow-editor/src/editor/CanvasSlideEditor.tsx`

- Display TextFormattingToolbar when text element selected
- Pass selected element properties to toolbar
- Handle property updates from toolbar
- Real-time preview of style changes

#### 2.5 Styling
**New File**: `/slideshow-editor/src/editor/TextFormattingToolbar.css`

- Modern, compact toolbar design
- Icon buttons for common actions
- Grouped sections (font, alignment, color, advanced)
- Dropdown menus for font selection
- Color pickers with recent colors
- Tooltips for all controls

---

## Phase 3: Advanced Typography (Medium Priority)

### Goal
Add professional typography features for high-quality presentations.

### Technical Implementation

#### 3.1 Font Loading System
**New File**: `/slideshow-editor/src/utils/fontLoader.ts`

- Integration with Google Fonts API
- Load font families on demand
- Cache loaded fonts
- Fallback to web-safe fonts
- Font preview in dropdown

Available font categories:
- **Serif**: Georgia, Times New Roman, Garamond, Merriweather, Playfair Display
- **Sans-serif**: Arial, Helvetica, Verdana, Roboto, Open Sans, Lato, Montserrat
- **Monospace**: Courier New, Consolas, Monaco, Source Code Pro
- **Display**: Impact, Bebas Neue, Oswald
- **Handwriting**: Brush Script, Pacifico, Dancing Script

#### 3.2 Text Shadow & Stroke
Add UI controls for:

**Text Shadow**:
- Horizontal offset slider
- Vertical offset slider
- Blur radius slider
- Shadow color picker
- Multiple shadows support

**Text Stroke** (outline):
- Stroke width slider (0-5px)
- Stroke color picker
- Combines with fill color

Generate CSS string: `textShadow: "2px 2px 4px rgba(0,0,0,0.5)"`

#### 3.3 Paragraph Controls
- Text indentation
- Paragraph spacing (margin top/bottom)
- Text overflow handling (ellipsis, clip, scroll)
- Vertical alignment within text box

#### 3.4 Text Effects Presets
**New File**: `/slideshow-editor/src/presets/textEffects.ts`

Pre-configured text effect combinations:
- **Neon glow**: Color + text-shadow with glow
- **3D effect**: Multiple shadows creating depth
- **Retro**: Specific font + colors + shadow
- **Outline**: Stroke without fill
- **Embossed**: Light/dark shadows for raised effect
- **Gradient text**: CSS gradient on text (via background-clip)

---

## Phase 4: Rich Text Support (Lower Priority)

### Goal
Support formatted text with multiple styles within a single element.

### Technical Implementation

#### 4.1 Rich Text Data Model
Update content from `string` to structured format:

```typescript
export interface TextElement extends BaseElement {
  type: 'text';
  content: string | RichTextContent; // Support both formats
  richTextEnabled?: boolean;
}

export interface RichTextContent {
  blocks: TextBlock[];
}

export interface TextBlock {
  type: 'paragraph' | 'heading' | 'list-item';
  spans: TextSpan[];
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface TextSpan {
  text: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    backgroundColor?: string;
  };
}
```

#### 4.2 Rich Text Editor
**New File**: `/slideshow-editor/src/editor/RichTextEditor.tsx`

- Replace contentEditable with proper rich text editor (TipTap, Slate, or Quill)
- Support inline formatting (bold, italic, underline, color)
- Support block formatting (headings, lists)
- Toolbar with formatting controls
- Keyboard shortcuts (Cmd+B for bold, etc.)

#### 4.3 List Support
- Bullet lists (ul)
- Numbered lists (ol)
- Custom list markers
- Nested lists
- List indentation controls

#### 4.4 Special Characters
- Emoji picker integration
- Symbol/special character palette
- Superscript/subscript support
- Fraction support

---

## Phase 5: Text Presets & Templates (Lower Priority)

### Goal
Speed up slide creation with pre-configured text styles.

### Technical Implementation

#### 5.1 Style Presets
**New File**: `/slideshow-editor/src/presets/textPresets.ts`

Default presets:
```typescript
export const TEXT_PRESETS = {
  title: {
    fontSize: 4,
    fontWeight: 'bold',
    fontFamily: 'Montserrat',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 2.5,
    fontWeight: 'normal',
    fontFamily: 'Roboto',
    color: '#cccccc',
    textAlign: 'center',
  },
  body: {
    fontSize: 1.5,
    fontWeight: 'normal',
    fontFamily: 'Open Sans',
    color: '#ffffff',
    textAlign: 'left',
    lineHeight: 1.6,
  },
  caption: {
    fontSize: 1,
    fontWeight: 'normal',
    fontFamily: 'Arial',
    color: '#999999',
    textAlign: 'left',
  },
  quote: {
    fontSize: 2,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    color: '#ffffff',
    textAlign: 'center',
  },
};
```

#### 5.2 Preset UI
Add preset selector to toolbar:
- Dropdown or button panel with preset names
- Visual preview of each preset
- Apply preset to selected text
- Override individual properties after applying

#### 5.3 Custom Presets
Allow users to save custom presets:
- "Save current style as preset" button
- Name custom preset
- Store in presentation settings
- Delete/edit custom presets
- Export/import presets

#### 5.4 Style Copying
- "Copy style" from one text element
- "Paste style" to another text element
- Style eyedropper tool

---

## Implementation Priority & Timeline

### Sprint 1 (Week 1): Phase 1 - Inline Editing
**Estimated effort**: 2-3 days
- Implement inline text editing
- Replace prompt() with contentEditable
- Add keyboard shortcuts
- Testing and polish

**Files to create/modify**:
- Create: `InlineTextEditor.tsx`, `InlineTextEditor.css`
- Modify: `CanvasSlideEditor.tsx`, `DraggableElement.tsx`

### Sprint 2 (Week 1-2): Phase 2 - Formatting Toolbar
**Estimated effort**: 3-4 days
- Design and implement toolbar UI
- Update TypeScript interfaces
- Add all basic formatting controls
- Connect toolbar to element updates
- Testing across all properties

**Files to create/modify**:
- Create: `TextFormattingToolbar.tsx`, `TextFormattingToolbar.css`
- Modify: `types/index.ts`, `CanvasSlideEditor.tsx`, `NewPlayer.tsx`

### Sprint 3 (Week 2): Phase 3 - Advanced Typography
**Estimated effort**: 2-3 days
- Font loading system
- Text shadow & stroke controls
- Effect presets
- Testing and refinement

**Files to create/modify**:
- Create: `utils/fontLoader.ts`, `presets/textEffects.ts`
- Modify: `TextFormattingToolbar.tsx`, `types/index.ts`

### Sprint 4 (Week 3): Phase 4 - Rich Text (Optional)
**Estimated effort**: 4-5 days
- Evaluate rich text library
- Implement rich text data model
- Migrate existing text elements
- List support
- Testing

**Files to create/modify**:
- Create: `RichTextEditor.tsx`, `utils/richTextConverter.ts`
- Modify: `types/index.ts`, multiple component files

### Sprint 5 (Week 3-4): Phase 5 - Presets (Optional)
**Estimated effort**: 2 days
- Implement preset system
- UI for applying presets
- Custom preset creation
- Style copying feature

**Files to create/modify**:
- Create: `presets/textPresets.ts`, `PresetSelector.tsx`
- Modify: `TextFormattingToolbar.tsx`

---

## Testing Requirements

### Phase 1 Testing
- [ ] Text editing works on double-click
- [ ] Edit mode exits on blur
- [ ] Escape cancels editing
- [ ] Multiline text with Shift+Enter
- [ ] Cannot drag/resize while editing
- [ ] Text updates persist after editing

### Phase 2 Testing
- [ ] All toolbar controls update text element
- [ ] Real-time preview of style changes
- [ ] Toolbar positions correctly
- [ ] Color pickers work properly
- [ ] Font dropdown loads and applies fonts
- [ ] Slider controls have proper ranges

### Phase 3 Testing
- [ ] Fonts load from Google Fonts
- [ ] Font fallbacks work
- [ ] Text shadows render correctly
- [ ] Text stroke/outline works
- [ ] Effect presets apply correctly
- [ ] Performance with many fonts

### Phase 4 Testing
- [ ] Rich text data migration works
- [ ] Backward compatibility with plain text
- [ ] Inline formatting persists
- [ ] Lists render correctly
- [ ] Copy/paste formatted text
- [ ] Export/playback preserves formatting

### Phase 5 Testing
- [ ] Presets apply correctly
- [ ] Custom presets save/load
- [ ] Style copying works
- [ ] Preset preview accurate

---

## Backward Compatibility

All new features must maintain backward compatibility:

1. **Optional Properties**: All new TextElement properties are optional
2. **Default Values**: Provide sensible defaults for missing properties
3. **Migration**: Existing presentations load without errors
4. **Fallbacks**: Plain text fallback if rich text unavailable

Example migration logic:
```typescript
const normalizeTextElement = (element: any): TextElement => {
  return {
    ...element,
    fontFamily: element.fontFamily || 'Arial',
    lineHeight: element.lineHeight || 1.5,
    letterSpacing: element.letterSpacing || 0,
    textDecoration: element.textDecoration || 'none',
    fontStyle: element.fontStyle || 'normal',
  };
};
```

---

## Future Enhancements (Post-Phase 5)

### Text Animations
- Fade in/out
- Slide in from direction
- Typewriter effect
- Character-by-character reveal
- Text path (curved text)

### Advanced Layout
- Text columns (newspaper style)
- Text wrapping around images
- Text inside shapes
- Vertical text orientation

### Collaboration Features
- Text comments/annotations
- Spelling/grammar check
- Find and replace
- Word count

### Accessibility
- Font size recommendations for readability
- Color contrast checker
- Screen reader optimization
- High contrast mode

---

## Technical Debt & Considerations

### Current Issues to Address
1. **Font Loading Performance**: Google Fonts may slow initial load
2. **State Management**: Consider Context API or Zustand for complex text state
3. **Undo/Redo**: Need comprehensive history system for text edits
4. **Memory**: Rich text with many styles may impact performance
5. **Export**: Ensure all text features work in player/export mode

### Architecture Decisions
- Keep inline editor lightweight (avoid heavy WYSIWYG libraries initially)
- Progressive enhancement: basic → advanced features
- Maintain separation: editing UI vs. rendering logic
- Use CSS variables for consistent theming

---

## Success Metrics

### Phase 1 Success
- ✓ Users can edit text inline without dialogs
- ✓ Edit mode feels natural and responsive
- ✓ No regressions in existing functionality

### Phase 2 Success
- ✓ 90% of common text styling needs met via toolbar
- ✓ Toolbar is intuitive (minimal learning curve)
- ✓ Real-time preview works smoothly

### Phase 3 Success
- ✓ Professional typography options available
- ✓ Text effects comparable to PowerPoint/Keynote
- ✓ Font loading doesn't impact performance

### Phase 4 Success
- ✓ Complex formatted text possible within single element
- ✓ Rich text editing feels native
- ✓ Backward compatibility maintained

### Phase 5 Success
- ✓ Presets speed up slide creation by 50%
- ✓ Custom presets work intuitively
- ✓ Style copying saves time

---

## Conclusion

These five phases transform the text editing system from basic to professional-grade. Phases 1 and 2 provide the most immediate value with inline editing and comprehensive formatting controls. Phases 3-5 add polish and power-user features.

**Recommended approach**: Implement Phase 1 and 2 in full, then evaluate user needs before proceeding to Phase 3-5.

**Estimated total effort**: 2-3 weeks for Phases 1-2, 4-5 weeks for all phases.

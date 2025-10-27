export type SlideType = 'canvas';

// Position and size stored as percentages (0-100) for responsive scaling
export interface ElementPosition {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of slide width
  height: number; // percentage of slide height
}

export interface BaseElement {
  id: string;
  position: ElementPosition;
  zIndex: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize?: number; // in rem
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
  lockAspectRatio?: boolean;
}

export interface VideoElement extends BaseElement {
  type: 'video';
  src: string;
  lockAspectRatio?: boolean;
}

export type SlideElement = TextElement | ImageElement | VideoElement;

export interface Slide {
  id: string;
  type: SlideType;
  elements: SlideElement[];
  background?: string;
  backgroundImage?: string;
}

export interface PresentationSettings {
  aspectRatio: '16:9' | '4:3';
  theme: 'dark' | 'light';
}

export interface Presentation {
  id: string;
  name: string;
  slides: Slide[];
  settings: PresentationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  presentation: Presentation;
  assetsPath: string;
}

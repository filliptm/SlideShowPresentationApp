import { TextElement } from '../types/index';

export interface TextPreset {
  name: string;
  style: Partial<TextElement>;
}

export const TEXT_PRESETS: TextPreset[] = [
  {
    name: 'Title',
    style: {
      fontSize: 4,
      fontWeight: 'bold',
      fontFamily: 'Montserrat',
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.2,
    },
  },
  {
    name: 'Subtitle',
    style: {
      fontSize: 2.5,
      fontWeight: 'normal',
      fontFamily: 'Roboto',
      color: '#cccccc',
      textAlign: 'center',
      lineHeight: 1.4,
    },
  },
  {
    name: 'Body',
    style: {
      fontSize: 1.5,
      fontWeight: 'normal',
      fontFamily: 'Open Sans',
      color: '#ffffff',
      textAlign: 'left',
      lineHeight: 1.6,
    },
  },
  {
    name: 'Caption',
    style: {
      fontSize: 1,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      color: '#999999',
      textAlign: 'left',
      lineHeight: 1.4,
    },
  },
  {
    name: 'Quote',
    style: {
      fontSize: 2,
      fontStyle: 'italic',
      fontFamily: 'Georgia',
      color: '#ffffff',
      textAlign: 'center',
      lineHeight: 1.5,
    },
  },
  {
    name: 'Code',
    style: {
      fontSize: 1.25,
      fontWeight: 'normal',
      fontFamily: 'Source Code Pro',
      color: '#00ff00',
      textAlign: 'left',
      lineHeight: 1.5,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
  },
  {
    name: 'Neon',
    style: {
      fontSize: 3,
      fontWeight: 'bold',
      fontFamily: 'Impact',
      color: '#00ffff',
      textAlign: 'center',
      textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
      lineHeight: 1.2,
    },
  },
  {
    name: '3D',
    style: {
      fontSize: 3.5,
      fontWeight: 'bold',
      fontFamily: 'Impact',
      color: '#ffffff',
      textAlign: 'center',
      textShadow: '2px 2px 0px #000, 4px 4px 0px #333, 6px 6px 0px #666',
      lineHeight: 1.2,
    },
  },
];

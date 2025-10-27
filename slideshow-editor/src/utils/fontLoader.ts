// Google Fonts loader utility
const loadedFonts = new Set<string>();

export const GOOGLE_FONTS = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',
  'Source Code Pro',
  'Merriweather',
  'Bebas Neue',
  'Oswald',
  'Pacifico',
  'Dancing Script',
];

export const WEB_SAFE_FONTS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Courier New',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
];

export const loadGoogleFont = (fontFamily: string): void => {
  if (loadedFonts.has(fontFamily) || WEB_SAFE_FONTS.includes(fontFamily)) {
    return;
  }

  if (GOOGLE_FONTS.includes(fontFamily)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
  }
};

export const preloadCommonFonts = (): void => {
  // Preload commonly used Google Fonts
  ['Roboto', 'Open Sans', 'Montserrat'].forEach(loadGoogleFont);
};

import { Presentation, Slide } from '../types/index';

const API_BASE = 'http://localhost:3001/api';

export class ProjectManager {
  private static ASSETS_BASE = '/projects';

  static createPresentation(name: string): Presentation {
    const id = Date.now().toString();
    return {
      id,
      name,
      slides: [],
      settings: {
        aspectRatio: '16:9',
        theme: 'dark',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  static async savePresentation(presentation: Presentation): Promise<void> {
    const response = await fetch(`${API_BASE}/presentations/${presentation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presentation),
    });

    if (!response.ok) {
      throw new Error('Failed to save presentation');
    }
  }

  static async createAndSavePresentation(presentation: Presentation): Promise<void> {
    const response = await fetch(`${API_BASE}/presentations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(presentation),
    });

    if (!response.ok) {
      throw new Error('Failed to create presentation');
    }
  }

  static async getPresentation(id: string): Promise<Presentation | null> {
    try {
      const response = await fetch(`${API_BASE}/presentations/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching presentation:', error);
      return null;
    }
  }

  static async getAllPresentations(): Promise<Presentation[]> {
    try {
      const response = await fetch(`${API_BASE}/presentations`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching presentations:', error);
      return [];
    }
  }

  static async deletePresentation(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/presentations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete presentation');
    }
  }

  static async uploadMedia(presentationId: string, file: File): Promise<{ path: string; type: 'image' | 'video' }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/presentations/${presentationId}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    const result = await response.json();
    return { path: result.path, type: result.type };
  }

  static createSlide(): Slide {
    const id = `slide-${Date.now()}`;

    return {
      id,
      type: 'canvas',
      elements: [],
      background: '#1a1a1a',
    };
  }

  static getAssetsPath(presentationId: string): string {
    return `${this.ASSETS_BASE}/${presentationId}/assets`;
  }
}

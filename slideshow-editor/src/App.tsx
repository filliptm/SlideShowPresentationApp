import { useState, useEffect } from 'react';
import { Presentation } from './types/index';
import { ProjectManager } from './core/ProjectManager';
import { NewSlideEditor } from './editor/NewSlideEditor';
import { NewPlayer } from './player/NewPlayer';
import './App.css';

type View = 'home' | 'editor' | 'player';

function App() {
  const [view, setView] = useState<View>('home');
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [currentPresentation, setCurrentPresentation] = useState<Presentation | null>(null);

  useEffect(() => {
    loadPresentations();
  }, []);

  const loadPresentations = async () => {
    const allPresentations = await ProjectManager.getAllPresentations();
    setPresentations(allPresentations);
  };

  const createNewPresentation = async () => {
    const name = prompt('Enter presentation name:');
    if (!name) return;

    const presentation = ProjectManager.createPresentation(name);
    await ProjectManager.createAndSavePresentation(presentation);
    await loadPresentations();
    openPresentation(presentation);
  };

  const openPresentation = (presentation: Presentation) => {
    setCurrentPresentation(presentation);
    setView('editor');
  };

  const deletePresentation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;
    await ProjectManager.deletePresentation(id);
    await loadPresentations();
  };

  const updatePresentation = async (presentation: Presentation) => {
    await ProjectManager.savePresentation(presentation);
    setCurrentPresentation(presentation);
    await loadPresentations();
  };

  const playPresentation = () => {
    setView('player');
  };

  const exitPlayer = () => {
    setView('editor');
  };

  const goHome = () => {
    setView('home');
    setCurrentPresentation(null);
  };

  if (view === 'player' && currentPresentation) {
    return <NewPlayer presentation={currentPresentation} onExit={exitPlayer} />;
  }

  if (view === 'editor' && currentPresentation) {
    return (
      <div className="editor-container">
        <div className="editor-header">
          <button onClick={goHome} className="back-btn">← Back to Projects</button>
        </div>
        <NewSlideEditor
          presentation={currentPresentation}
          onUpdate={updatePresentation}
          onPlay={playPresentation}
        />
      </div>
    );
  }

  return (
    <div className="app-home">
      <header className="app-header">
        <h1>Slideshow Presentation Studio</h1>
        <button onClick={createNewPresentation} className="create-btn">
          + New Presentation
        </button>
      </header>

      <div className="presentations-grid">
        {presentations.length === 0 ? (
          <div className="empty-state">
            <p>No presentations yet</p>
            <p>Create your first presentation to get started</p>
          </div>
        ) : (
          presentations.map((presentation) => (
            <div key={presentation.id} className="presentation-card">
              <div className="card-content" onClick={() => openPresentation(presentation)}>
                <h3>{presentation.name}</h3>
                <p className="slide-count">{presentation.slides.length} slides</p>
                <p className="date">
                  Updated: {new Date(presentation.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="card-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePresentation(presentation.id);
                  }}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;

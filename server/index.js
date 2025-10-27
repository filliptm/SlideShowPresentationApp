import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Projects directory
const PROJECTS_DIR = path.join(__dirname, '..', 'projects');

// Ensure projects directory exists
await fs.mkdir(PROJECTS_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from projects directory
app.use('/projects', express.static(PROJECTS_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const presentationId = req.params.id;
    const assetsDir = path.join(PROJECTS_DIR, presentationId, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });
    cb(null, assetsDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  }
});

const upload = multer({ storage });

// Helper function to get project file path
const getProjectPath = (id) => path.join(PROJECTS_DIR, id, 'project.json');

// Helper function to read project
const readProject = async (id) => {
  try {
    const data = await fs.readFile(getProjectPath(id), 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

// Helper function to write project
const writeProject = async (id, presentation) => {
  const projectDir = path.join(PROJECTS_DIR, id);
  await fs.mkdir(projectDir, { recursive: true });
  await fs.writeFile(
    getProjectPath(id),
    JSON.stringify(presentation, null, 2),
    'utf-8'
  );
};

// API Routes

// Get all presentations
app.get('/api/presentations', async (req, res) => {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const presentations = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const presentation = await readProject(entry.name);
        if (presentation) {
          presentations.push(presentation);
        }
      }
    }

    // Sort by updated date (newest first)
    presentations.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(presentations);
  } catch (error) {
    console.error('Error reading presentations:', error);
    res.status(500).json({ error: 'Failed to read presentations' });
  }
});

// Get single presentation
app.get('/api/presentations/:id', async (req, res) => {
  try {
    const presentation = await readProject(req.params.id);
    if (!presentation) {
      return res.status(404).json({ error: 'Presentation not found' });
    }
    res.json(presentation);
  } catch (error) {
    console.error('Error reading presentation:', error);
    res.status(500).json({ error: 'Failed to read presentation' });
  }
});

// Create presentation
app.post('/api/presentations', async (req, res) => {
  try {
    const presentation = req.body;
    await writeProject(presentation.id, presentation);
    res.json(presentation);
  } catch (error) {
    console.error('Error creating presentation:', error);
    res.status(500).json({ error: 'Failed to create presentation' });
  }
});

// Update presentation
app.put('/api/presentations/:id', async (req, res) => {
  try {
    const presentation = req.body;
    presentation.updatedAt = new Date().toISOString();
    await writeProject(req.params.id, presentation);
    res.json(presentation);
  } catch (error) {
    console.error('Error updating presentation:', error);
    res.status(500).json({ error: 'Failed to update presentation' });
  }
});

// Delete presentation
app.delete('/api/presentations/:id', async (req, res) => {
  try {
    const projectDir = path.join(PROJECTS_DIR, req.params.id);
    await fs.rm(projectDir, { recursive: true, force: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting presentation:', error);
    res.status(500).json({ error: 'Failed to delete presentation' });
  }
});

// Upload media file
app.post('/api/presentations/:id/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the path relative to the server root
    const relativePath = `/projects/${req.params.id}/assets/${req.file.filename}`;

    res.json({
      filename: req.file.filename,
      path: relativePath,
      type: req.file.mimetype.startsWith('video/') ? 'video' : 'image'
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Slideshow backend server running at http://localhost:${PORT}`);
  console.log(`📁 Projects directory: ${PROJECTS_DIR}`);
});

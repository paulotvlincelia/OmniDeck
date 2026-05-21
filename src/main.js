import './core/slides2.css'
import './core/constants.js'
import './core/autoflow.js'
import './core/deckset-parser.js'
import './core/slides2.js'
import './core/print-mode.js'
import { exportAndDownload } from './core/pdf-export.js'

const REVEAL_CONFIG = {
  width: 1280,
  height: 720,
  margin: 0.06,
  hash: true,
  controls: true,
  progress: true,
};

let revealInitialized = false;
let currentFilename = 'slides';

function render(markdown) {
  const html = window.parseDecksetMarkdown(markdown, { autoflow: true });
  const slidesContainer = document.querySelector('.slides');
  if (!slidesContainer) {
    console.error('.slides container not found in DOM');
    return 0;
  }
  slidesContainer.innerHTML = html;

  if (!window.Reveal) {
    console.error('StellarSlides/Reveal engine not found on window');
    return 0;
  }

  if (!revealInitialized) {
    window.Reveal.initialize(REVEAL_CONFIG);
    revealInitialized = true;
  } else {
    // Reset hash + indexh BEFORE sync so the new deck's slide 0 becomes present.
    // sync() applies present/past/future based on the engine's current indexh,
    // which may point past the new deck's length — leaving nothing visible.
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    const state = window.Reveal.getState();
    state.indexh = 0;
    window.Reveal.sync();
    window.Reveal.slide(0);
    window.Reveal.layout();
  }

  const sectionCount = slidesContainer.querySelectorAll(':scope > section').length;
  return sectionCount;
}

function showToast(msg, isError = false) {
  let toast = document.getElementById('omnideck-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'omnideck-toast';
    const style = document.createElement('style');
    style.textContent = `
      #omnideck-toast {
        position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
        padding: 10px 18px; border-radius: 8px;
        background: rgba(15,15,18,0.92); color: #e2e8f0;
        font: 13px system-ui,-apple-system,sans-serif;
        z-index: 9997; opacity: 0; transition: opacity 0.2s;
        max-width: 70vw; text-align: center;
      }
      #omnideck-toast.show { opacity: 1; }
      #omnideck-toast.error { background: rgba(120,20,20,0.92); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'show' + (isError ? ' error' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = ''; }, 3500);
}

function describeRenderState(count, filename) {
  const slidesEl = document.querySelector('.slides');
  const sections = slidesEl ? Array.from(slidesEl.children) : [];
  const present = sections.filter(s => s.classList.contains('present'));
  const slidesRect = slidesEl ? slidesEl.getBoundingClientRect() : null;
  const presentSection = present[0];
  const presentRect = presentSection ? presentSection.getBoundingClientRect() : null;
  const slidesDim = slidesRect ? `${Math.round(slidesRect.width)}x${Math.round(slidesRect.height)}` : 'no-rect';
  const presentDim = presentRect ? `${Math.round(presentRect.width)}x${Math.round(presentRect.height)}` : 'no-present';
  const presentIdx = presentSection ? sections.indexOf(presentSection) : -1;
  return `${filename} — ${count} sections | present idx=${presentIdx} | .slides=${slidesDim} | section=${presentDim}`;
}

async function loadAndRenderFile(file) {
  try {
    const md = await loadFromFile(file);
    if (!md || !md.trim()) {
      showToast(`${file.name} appears to be empty`, true);
      return;
    }
    currentFilename = file.name.replace(/\.(md|markdown)$/i, '');
    const count = render(md);
    if (count === 0) {
      showToast(`${file.name}: parser produced 0 slides`, true);
    } else {
      showToast(describeRenderState(count, file.name));
    }
  } catch (err) {
    console.error('Failed to load file:', err);
    showToast(`Failed to load ${file.name}: ${err.message}`, true);
  }
}

async function loadFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.statusText}`);
  return response.text();
}

function loadFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function buildToolbar() {
  const toolbar = document.createElement('div');
  toolbar.id = 'omnideck-toolbar';
  toolbar.innerHTML = `
    <label class="od-btn" title="Open .md file">
      <input type="file" accept=".md,.markdown,text/markdown" hidden />
      <span>Open</span>
    </label>
    <button class="od-btn" id="od-export-pdf" title="Export PDF (⌘/Ctrl+E)">Export PDF</button>
  `;
  const style = document.createElement('style');
  style.textContent = `
    #omnideck-toolbar {
      position: fixed;
      top: 12px;
      right: 12px;
      z-index: 1000;
      display: flex;
      gap: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      opacity: 0.35;
      transition: opacity 0.2s;
    }
    #omnideck-toolbar:hover { opacity: 1; }
    #omnideck-toolbar .od-btn {
      padding: 6px 12px;
      background: rgba(15, 15, 18, 0.85);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      cursor: pointer;
      user-select: none;
    }
    #omnideck-toolbar .od-btn:hover { background: rgba(30, 30, 35, 0.95); }
    #omnideck-dropzone {
      position: fixed; inset: 0;
      background: rgba(14, 165, 233, 0.12);
      border: 3px dashed rgba(14, 165, 233, 0.6);
      pointer-events: none;
      display: none;
      z-index: 9998;
      align-items: center;
      justify-content: center;
      color: #0ea5e9;
      font: 600 1.4rem system-ui, sans-serif;
    }
    #omnideck-dropzone.active { display: flex; }
  `;
  document.head.appendChild(style);
  document.body.appendChild(toolbar);

  const dropzone = document.createElement('div');
  dropzone.id = 'omnideck-dropzone';
  dropzone.textContent = 'Drop .md to load';
  document.body.appendChild(dropzone);

  const fileInput = toolbar.querySelector('input[type=file]');
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadAndRenderFile(file);
    fileInput.value = '';
  });

  toolbar.querySelector('#od-export-pdf').addEventListener('click', () => {
    exportAndDownload(`${currentFilename}.pdf`).catch(err => {
      console.error('PDF export failed:', err);
      alert(`PDF export failed: ${err.message}`);
    });
  });
}

function bindDragAndDrop() {
  const dropzone = document.getElementById('omnideck-dropzone');
  let dragDepth = 0;

  document.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragDepth++;
    dropzone.classList.add('active');
  });
  document.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDepth--;
    if (dragDepth <= 0) {
      dragDepth = 0;
      dropzone.classList.remove('active');
    }
  });
  document.addEventListener('dragover', (e) => { e.preventDefault(); });
  document.addEventListener('drop', async (e) => {
    e.preventDefault();
    dragDepth = 0;
    dropzone.classList.remove('active');
    const file = e.dataTransfer?.files?.[0];
    if (!file) {
      showToast('No file in drop', true);
      return;
    }
    if (!/\.(md|markdown)$/i.test(file.name)) {
      showToast(`Not a markdown file: ${file.name}`, true);
      return;
    }
    await loadAndRenderFile(file);
  });
}

function bindKeyboard() {
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl+E → export PDF
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      exportAndDownload(`${currentFilename}.pdf`).catch(err => {
        console.error('PDF export failed:', err);
        alert(`PDF export failed: ${err.message}`);
      });
      return;
    }
    if (!window.Reveal || !revealInitialized) return;
    // Don't hijack keys when user is typing in an input
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        if (e.shiftKey && e.key === ' ') {
          window.Reveal.prev();
        } else {
          window.Reveal.next();
        }
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        window.Reveal.prev();
        e.preventDefault();
        break;
      case 'Home':
        window.Reveal.slide(0);
        e.preventDefault();
        break;
      case 'End':
        window.Reveal.slide(window.Reveal.getTotalSlides() - 1);
        e.preventDefault();
        break;
    }
  });
}

async function init() {
  buildToolbar();
  bindDragAndDrop();
  bindKeyboard();

  try {
    const markdown = await loadFromUrl('/test.md');
    render(markdown);
  } catch (err) {
    console.error('Failed to load initial test.md:', err);
    document.querySelector('.slides').innerHTML =
      '<section><h2>Drop a .md file or click Open</h2></section>';
    if (window.Reveal && !revealInitialized) {
      window.Reveal.initialize(REVEAL_CONFIG);
      revealInitialized = true;
    }
  }
}

init();

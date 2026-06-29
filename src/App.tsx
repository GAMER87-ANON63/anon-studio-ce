import { useState } from 'react';
import { Settings, Download, Play, Box, Layers, MousePointer2, Move, Square, Circle, Plus, Palette, Settings2 } from 'lucide-react';
import { useSceneStore } from './store/sceneStore';
import { SceneObject } from './components/canvas/SceneObject';
import { PixelEditor } from './components/assets/PixelEditor';
import { GamePreview } from './components/runtime/GamePreview';
import { ExportMenu } from './components/export/ExportMenu';
import { CodeEditor } from './components/editor/CodeEditor';
import { create } from 'zustand';
import './App.css';

interface IdeState {
  isPlaying: boolean;
  setIsPlaying: (p: boolean) => void;
  viewMode: 'scene' | 'events';
  setViewMode: (v: 'scene' | 'events') => void;
}

const useIdeStore = create<IdeState>((set) => ({
  isPlaying: false,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  viewMode: 'scene',
  setViewMode: (viewMode) => set({ viewMode })
}));

function App() {
  const { isPlaying, setIsPlaying, viewMode, setViewMode } = useIdeStore();
  const [isPixelEditorOpen, setIsPixelEditorOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const { objects, selectedIds, selectObject, addObject } = useSceneStore();

  return (
    <div className="app-container">
      {isPlaying && <GamePreview />}
      {isPixelEditorOpen && <PixelEditor onClose={() => setIsPixelEditorOpen(false)} />}
      {showExport && <ExportMenu onClose={() => setShowExport(false)} />}

      <header className="toolbar">
        <div className="toolbar-group">
          <div className="branding">
            <span style={{ fontSize: 20 }}>🎮</span>
            Anon Studio
            <span className="badge">Code Edition</span>
          </div>
        </div>

        <div className="toolbar-group" style={{ background: 'var(--bg-base)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button style={{ background: viewMode === 'scene' ? 'var(--bg-surface-elevated)' : 'transparent', color: viewMode === 'scene' ? 'var(--text-main)' : 'var(--text-muted)', padding: '4px 12px', fontSize: 13, borderRadius: 4 }} onClick={() => setViewMode('scene')}>
            Scene Designer
          </button>
          <button style={{ background: viewMode === 'events' ? 'var(--bg-surface-elevated)' : 'transparent', color: viewMode === 'events' ? 'var(--text-main)' : 'var(--text-muted)', padding: '4px 12px', fontSize: 13, borderRadius: 4 }} onClick={() => setViewMode('events')}>
            Code Editor (A#)
          </button>
        </div>

        <div className="toolbar-group">
          <button className="icon-btn" title="Settings"><Settings size={18} /></button>
          <button className="primary" onClick={() => setShowExport(true)}>
            <Download size={18} /> Export
          </button>
          <button className="primary" onClick={() => setIsPlaying(true)}>
            <Play size={18} fill="currentColor" /> Play Game
          </button>
        </div>
      </header>

      {viewMode === 'scene' ? (
        <main className="workspace">
          {/* LEFT PANEL */}
          <aside className="panel-left">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={16} /> Hierarchy</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="icon-btn" title="Add Object"><Plus size={16} /></button>
              </div>
            </div>
            <div className="object-tree">
              {objects.map(obj => (
                <div 
                  key={obj.id} 
                  className={`tree-item ${selectedIds.includes(obj.id) ? 'selected' : ''}`}
                  onClick={() => selectObject(obj.id)}
                >
                  <Box size={14} color="#7b61ff" />
                  {obj.name}
                </div>
              ))}
              {objects.length === 0 && (
                <div className="empty-state">No objects in scene</div>
              )}
            </div>
          </aside>

          {/* CENTER CANVAS */}
          <section className="canvas-area">
            <div className="canvas-toolbar">
              <button className="icon-btn" onClick={() => setIsPixelEditorOpen(true)} title="Open Pixel Studio"><Palette size={16} /> Draw</button>
              <div style={{ width: 1, height: 16, background: 'var(--border)' }}></div>
              <button className="icon-btn"><MousePointer2 size={16} /></button>
              <button className="icon-btn"><Move size={16} /></button>
              <button className="icon-btn" onClick={() => addObject({ id: `obj-${Date.now()}`, name: 'New Block', type: 'rectangle', x: 200, y: 200, width: 64, height: 64, color: '#3b82f6' })}><Square size={16} /></button>
              <button className="icon-btn" onClick={() => addObject({ id: `obj-${Date.now()}`, name: 'New Circle', type: 'circle', x: 300, y: 200, width: 64, height: 64, color: '#ef4444' })}><Circle size={16} /></button>
            </div>
            
            <div className="viewport">
              <div className="viewport-bounds">
                {objects.map(obj => (
                  <SceneObject key={obj.id} obj={obj} isSelected={selectedIds.includes(obj.id)} />
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT PANEL (PROPERTIES) */}
          <aside className="panel-right">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings2 size={16} /> Properties</div>
            </div>
            
            {selectedIds.length === 1 ? (
              <div className="properties-form">
                <div className="prop-group">
                  <label>Name</label>
                  <input type="text" value={objects.find(o => o.id === selectedIds[0])?.name || ''} readOnly className="prop-input" />
                </div>
                <div className="prop-row">
                  <div className="prop-group">
                    <label>X</label>
                    <input type="number" value={objects.find(o => o.id === selectedIds[0])?.x || 0} readOnly className="prop-input" />
                  </div>
                  <div className="prop-group">
                    <label>Y</label>
                    <input type="number" value={objects.find(o => o.id === selectedIds[0])?.y || 0} readOnly className="prop-input" />
                  </div>
                </div>
                <div className="prop-group">
                  <label>Color</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 4, background: objects.find(o => o.id === selectedIds[0])?.color || '#000' }}></div>
                    <input type="text" value={objects.find(o => o.id === selectedIds[0])?.color || ''} readOnly className="prop-input" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                {selectedIds.length > 1 ? 'Multiple objects selected' : 'Select an object to edit properties'}
              </div>
            )}
          </aside>
        </main>
      ) : (
        <CodeEditor />
      )}
    </div>
  );
}

export default App;

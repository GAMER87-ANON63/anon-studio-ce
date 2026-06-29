import { useState, useRef } from "react";
import { 
  Play, Settings, Plus, 
  MousePointer2, Square, Circle, Type, Image as ImageIcon,
  Layers, Package, Hash, Palette, Upload, Download
} from "lucide-react";
import "./App.css";
import { useSceneStore, GameObject } from "./store/sceneStore";
import { SceneObject } from "./components/canvas/SceneObject";
import { GamePreview } from "./components/runtime/GamePreview";
import { EventSheet } from "./components/events/EventSheet";
import { PixelEditor } from "./components/assets/PixelEditor";
import { ExportMenu } from "./components/export/ExportMenu";

function App() {
  const { objects, assets, selectedIds, clearSelection, updateObject, addObject, addAsset, isPlaying, setIsPlaying } = useSceneStore();
  
  const [viewMode, setViewMode] = useState<'scene' | 'events'>('scene');
  const [isPixelEditorOpen, setIsPixelEditorOpen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedObj = selectedIds.length === 1 
    ? objects.find(o => o.id === selectedIds[0]) 
    : null;

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) clearSelection();
  };

  const handleAddObject = (type: GameObject['type']) => {
    const newObj: GameObject = {
      id: `obj-${Date.now()}`,
      name: `New ${type}`,
      type,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: type === 'sprite' ? 64 : 100,
      height: type === 'sprite' ? 64 : 100,
      color: type === 'sprite' ? '#7b61ff' : '#00d2ff'
    };
    addObject(newObj);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      addAsset({
        id: `asset-${Date.now()}`,
        name: file.name,
        dataUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
  };

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
            <span className="badge">NCE</span>
          </div>
        </div>

        <div className="toolbar-group" style={{ background: 'var(--bg-base)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
          <button style={{ background: viewMode === 'scene' ? 'var(--bg-surface-elevated)' : 'transparent', color: viewMode === 'scene' ? 'var(--text-main)' : 'var(--text-muted)', padding: '4px 12px', fontSize: 13, borderRadius: 4 }} onClick={() => setViewMode('scene')}>
            Scene 1
          </button>
          <button style={{ background: viewMode === 'events' ? 'var(--bg-surface-elevated)' : 'transparent', color: viewMode === 'events' ? 'var(--text-main)' : 'var(--text-muted)', padding: '4px 12px', fontSize: 13, borderRadius: 4 }} onClick={() => setViewMode('events')}>
            Scene 1 (Events)
          </button>
        </div>

        <div className="toolbar-group">
          <button className="icon-btn" title="Settings"><Settings size={18} /></button>
          <button className="primary" onClick={() => setShowExport(true)}>
            <Download size={18} /> Export
          </button>
          <button className="primary" onClick={() => setIsPlaying(true)}>
            <Play size={18} fill="currentColor" /> Play Preview
          </button>
        </div>
      </header>

      {viewMode === 'scene' ? (
        <main className="workspace">
          {/* LEFT PANEL */}
          <aside className="panel-left">
            <div className="panel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Layers size={16} /> Hierarchy</div>
              <button className="icon-btn" style={{ padding: 4 }}><Plus size={16} /></button>
            </div>
            <div className="panel-content" style={{ flex: 1 }}>
              {objects.map(obj => (
                <div key={obj.id} onClick={() => useSceneStore.getState().selectObject(obj.id)} style={{ padding: '8px 12px', background: selectedIds.includes(obj.id) ? 'var(--bg-surface-elevated)' : 'transparent', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, border: selectedIds.includes(obj.id) ? '1px solid var(--primary)' : '1px solid transparent', color: selectedIds.includes(obj.id) ? 'var(--primary)' : 'var(--text-main)', cursor: 'pointer', marginBottom: 4 }}>
                  {obj.type === 'sprite' ? <ImageIcon size={14} /> : <Hash size={14} />} {obj.name}
                </div>
              ))}
            </div>

            <div className="panel-header" style={{ borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Package size={16} /> Assets</div>
              <div style={{ display: 'flex', gap: 4 }}>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" style={{ display: 'none' }} />
                <button className="icon-btn" style={{ padding: 4 }} onClick={() => fileInputRef.current?.click()} title="Upload Image"><Upload size={16} /></button>
                <button className="icon-btn" style={{ padding: 4 }} onClick={() => setIsPixelEditorOpen(true)} title="Create Pixel Art"><Palette size={16} /></button>
              </div>
            </div>
            <div className="panel-content" style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {assets.map(asset => (
                  <div key={asset.id} style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 4, padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <img src={asset.dataUrl} alt={asset.name} style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated' }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{asset.name}</span>
                  </div>
                ))}
              </div>
              {assets.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>
                  Upload images or draw pixel art.
                </div>
              )}
            </div>
          </aside>

          {/* CENTER CANVAS */}
          <section className="canvas-area" onPointerDown={handleCanvasClick}>
            <div className="canvas-grid" style={{ pointerEvents: 'none' }}></div>
            
            <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8, background: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 8, border: '1px solid var(--border)', zIndex: 10 }}>
              <button className="icon-btn" title="Select Tool"><MousePointer2 size={18} /></button>
              <div style={{ width: 1, height: 24, background: 'var(--border)' }}></div>
              <button className="icon-btn" title="Add Sprite" onClick={() => handleAddObject('sprite')}><ImageIcon size={18} /></button>
              <button className="icon-btn" title="Add Rectangle" onClick={() => handleAddObject('rectangle')}><Square size={18} /></button>
              <button className="icon-btn" title="Add Circle" onClick={() => handleAddObject('circle')}><Circle size={18} /></button>
              <button className="icon-btn" title="Add Text" onClick={() => handleAddObject('text')}><Type size={18} /></button>
            </div>

            {objects.map(obj => (
              <SceneObject key={obj.id} obj={obj} isSelected={selectedIds.includes(obj.id)} />
            ))}
          </section>

          {/* RIGHT PANEL */}
          <aside className="panel-right">
            <div className="panel-header">Properties</div>
            <div className="panel-content">
              {selectedObj ? (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Transform</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>X</div><input type="number" value={Math.round(selectedObj.x)} onChange={e => updateObject(selectedObj.id, { x: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4, fontFamily: 'inherit' }} /></div>
                      <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Y</div><input type="number" value={Math.round(selectedObj.y)} onChange={e => updateObject(selectedObj.id, { y: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4, fontFamily: 'inherit' }} /></div>
                      <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Width</div><input type="number" value={Math.round(selectedObj.width)} onChange={e => updateObject(selectedObj.id, { width: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4, fontFamily: 'inherit' }} /></div>
                      <div><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Height</div><input type="number" value={Math.round(selectedObj.height)} onChange={e => updateObject(selectedObj.id, { height: Number(e.target.value) })} style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4, fontFamily: 'inherit' }} /></div>
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Appearance</div>
                    
                    {selectedObj.type === 'sprite' && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Texture</div>
                        <select 
                          value={selectedObj.textureId || ''} 
                          onChange={e => updateObject(selectedObj.id, { textureId: e.target.value })}
                          style={{ width: '100%', background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4 }}
                        >
                          <option value="">(None)</option>
                          {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>
                    )}
                    
                    {!selectedObj.textureId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 4, background: selectedObj.color, border: '1px solid var(--border-light)' }}></div>
                        <input type="text" value={selectedObj.color} onChange={e => updateObject(selectedObj.id, { color: e.target.value })} style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: 4, fontFamily: 'inherit' }} />
                      </div>
                    )}
                  </div>

                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>Select an object to edit properties</div>
              )}
            </div>
          </aside>
        </main>
      ) : (
        <main className="workspace" style={{ background: 'var(--bg-base)', display: 'block', overflowY: 'auto' }}>
          <EventSheet />
        </main>
      )}
    </div>
  );
}

export default App;

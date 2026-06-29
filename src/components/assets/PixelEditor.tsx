import { useState } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { X, Save, Palette, Eraser } from 'lucide-react';

export function PixelEditor({ onClose }: { onClose: () => void }) {
  const [pixels, setPixels] = useState<string[]>(Array(16 * 16).fill(''));
  const [color, setColor] = useState('#7b61ff');
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [isDrawing, setIsDrawing] = useState(false);
  const [assetName, setAssetName] = useState('New Sprite');
  const addAsset = useSceneStore(state => state.addAsset);

  const colors = ['#000000', '#ffffff', '#ff4d4f', '#12c988', '#00d2ff', '#7b61ff', '#ffb800', '#ff00ff'];

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    updatePixel(index);
  };

  const handlePointerEnter = (index: number) => {
    if (isDrawing) updatePixel(index);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDrawing(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const updatePixel = (index: number) => {
    const newPixels = [...pixels];
    newPixels[index] = mode === 'draw' ? color : '';
    setPixels(newPixels);
  };

  const handleSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;
    pixels.forEach((col, i) => {
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(i % 16, Math.floor(i / 16), 1, 1);
      }
    });
    
    addAsset({
      id: `asset-${Date.now()}`,
      name: assetName,
      dataUrl: canvas.toDataURL()
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 600, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
        
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Palette size={18} /> Pixel Art Editor</h3>
          <button className="icon-btn" onClick={onClose} style={{ padding: 0 }}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, display: 'flex', gap: 32 }}>
          {/* Tools & Palette */}
          <div style={{ width: 120 }}>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Sprite Name</label>
              <input type="text" value={assetName} onChange={e => setAssetName(e.target.value)} style={{ width: '100%', padding: 6, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
            </div>

            <div style={{ marginBottom: 24, display: 'flex', gap: 8 }}>
              <button 
                className="icon-btn" 
                style={{ flex: 1, background: mode === 'draw' ? 'var(--primary)' : 'var(--bg-base)', color: mode === 'draw' ? 'white' : 'var(--text-muted)' }}
                onClick={() => setMode('draw')}
              >
                <Palette size={16} />
              </button>
              <button 
                className="icon-btn" 
                style={{ flex: 1, background: mode === 'erase' ? 'var(--primary)' : 'var(--bg-base)', color: mode === 'erase' ? 'white' : 'var(--text-muted)' }}
                onClick={() => setMode('erase')}
              >
                <Eraser size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {colors.map(c => (
                <div 
                  key={c} 
                  onClick={() => { setColor(c); setMode('draw'); }}
                  style={{ height: 32, background: c, borderRadius: 4, cursor: 'pointer', border: color === c && mode === 'draw' ? '2px solid white' : '1px solid var(--border-light)' }}
                ></div>
              ))}
            </div>
            
            <div style={{ marginTop: 16 }}>
              <input type="color" value={color} onChange={e => { setColor(e.target.value); setMode('draw'); }} style={{ width: '100%', height: 32, cursor: 'pointer', background: 'none', border: 'none' }} />
            </div>
          </div>

          {/* Canvas area */}
          <div 
            style={{ 
              width: 384, height: 384, 
              background: '#2c2d3c', 
              backgroundImage: 'linear-gradient(45deg, #171821 25%, transparent 25%, transparent 75%, #171821 75%, #171821), linear-gradient(45deg, #171821 25%, transparent 25%, transparent 75%, #171821 75%, #171821)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
              display: 'grid', gridTemplateColumns: 'repeat(16, 1fr)', gridTemplateRows: 'repeat(16, 1fr)',
              border: '1px solid var(--border)'
            }}
            onPointerLeave={() => setIsDrawing(false)}
          >
            {pixels.map((col, i) => (
              <div 
                key={i}
                onPointerDown={(e) => handlePointerDown(i, e)}
                onPointerEnter={() => handlePointerEnter(i)}
                onPointerUp={handlePointerUp}
                style={{ 
                  background: col || 'transparent', 
                  borderRight: '1px solid rgba(255,255,255,0.05)', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  cursor: 'crosshair',
                  touchAction: 'none'
                }}
              ></div>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 24px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button style={{ padding: '6px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} onClick={onClose}>Cancel</button>
          <button className="primary" style={{ padding: '6px 16px' }} onClick={handleSave}><Save size={16} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} /> Save to Assets</button>
        </div>

      </div>
    </div>
  );
}

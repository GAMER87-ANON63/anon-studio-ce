import { useState, useRef } from 'react';
import { GameObject, useSceneStore } from '../../store/sceneStore';

interface SceneObjectProps {
  obj: GameObject;
  isSelected: boolean;
}

export function SceneObject({ obj, isSelected }: SceneObjectProps) {
  const updateObject = useSceneStore(state => state.updateObject);
  const selectObject = useSceneStore(state => state.selectObject);
  const assets = useSceneStore(state => state.assets);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0, objX: 0, objY: 0 });

  const texture = obj.textureId ? assets.find(a => a.id === obj.textureId) : null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isSelected) selectObject(obj.id, e.shiftKey);

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      objX: obj.x,
      objY: obj.y
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    updateObject(obj.id, {
      x: dragStartPos.current.objX + dx,
      y: dragStartPos.current.objY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'absolute',
        left: obj.x,
        top: obj.y,
        width: obj.width,
        height: obj.height,
        backgroundColor: texture ? 'transparent' : obj.color,
        backgroundImage: texture ? `url(${texture.dataUrl})` : 'none',
        backgroundSize: '100% 100%',
        imageRendering: 'pixelated', // crisp pixel art
        borderRadius: obj.type === 'circle' && !texture ? '50%' : 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isSelected ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
        border: isSelected ? '2px solid white' : (texture ? 'none' : '1px solid var(--border-light)'),
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        transform: `translate(-50%, -50%)`, 
        touchAction: 'none'
      }}
    >
      {obj.type === 'sprite' && !texture && <span style={{ fontSize: 24, pointerEvents: 'none' }}>👾</span>}
      {obj.type === 'text' && <span style={{ color: obj.color, fontWeight: 600, pointerEvents: 'none' }}>{obj.name}</span>}

      {isSelected && (
        <>
          <div className="handle" style={{ position: 'absolute', top: -5, left: -5, width: 10, height: 10, background: 'white', border: '1px solid var(--primary)', cursor: 'nwse-resize' }} />
          <div className="handle" style={{ position: 'absolute', top: -5, right: -5, width: 10, height: 10, background: 'white', border: '1px solid var(--primary)', cursor: 'nesw-resize' }} />
          <div className="handle" style={{ position: 'absolute', bottom: -5, left: -5, width: 10, height: 10, background: 'white', border: '1px solid var(--primary)', cursor: 'nesw-resize' }} />
          <div className="handle" style={{ position: 'absolute', bottom: -5, right: -5, width: 10, height: 10, background: 'white', border: '1px solid var(--primary)', cursor: 'nwse-resize' }} />
        </>
      )}
    </div>
  );
}

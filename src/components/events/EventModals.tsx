import { useState } from 'react';
import { useSceneStore, Condition, Action } from '../../store/sceneStore';
import { X } from 'lucide-react';

interface ConditionModalProps {
  onAdd: (cond: Omit<Condition, 'id'>) => void;
  onClose: () => void;
}

export function ConditionModal({ onAdd, onClose }: ConditionModalProps) {
  const objects = useSceneStore(state => state.objects);
  const [selectedType, setSelectedType] = useState('keyboard_pressed');
  
  const [keyParam, setKeyParam] = useState('Space');
  const [objAParam, setObjAParam] = useState(objects[0]?.id || '');
  const [objBParam, setObjBParam] = useState(objects[1]?.id || '');
  const [mouseButtonParam, setMouseButtonParam] = useState('left');
  const [varName, setVarName] = useState('Score');
  const [varOp, setVarOp] = useState('==');
  const [varVal, setVarVal] = useState(10);

  const handleSubmit = () => {
    if (selectedType === 'keyboard_pressed') {
      onAdd({ type: 'keyboard_pressed', params: { key: keyParam } });
    } else if (selectedType === 'collision') {
      onAdd({ type: 'collision', params: { objA: objAParam, objB: objBParam } });
    } else if (selectedType === 'always') {
      onAdd({ type: 'always', params: {} });
    } else if (selectedType === 'mouse_clicked') {
      onAdd({ type: 'mouse_clicked', params: { button: mouseButtonParam } });
    } else if (selectedType === 'check_variable') {
      onAdd({ type: 'check_variable', params: { varName, operator: varOp, value: varVal } });
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 500, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Add Condition</h3>
          <button className="icon-btn" onClick={onClose} style={{ padding: 0 }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Condition Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
            <option value="keyboard_pressed">Keyboard: Key is pressed</option>
            <option value="mouse_clicked">Mouse: Button Clicked</option>
            <option value="collision">Physics: Collision between objects</option>
            <option value="check_variable">Logic: Check Global Variable</option>
            <option value="always">Logic: Always (Every frame)</option>
          </select>
        </div>

        {selectedType === 'keyboard_pressed' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Key Code (e.g. Space, ArrowRight)</label>
            <input type="text" value={keyParam} onChange={e => setKeyParam(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
          </div>
        )}

        {selectedType === 'mouse_clicked' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Mouse Button</label>
            <select value={mouseButtonParam} onChange={e => setMouseButtonParam(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
              <option value="left">Left Click</option>
              <option value="right">Right Click</option>
            </select>
          </div>
        )}

        {selectedType === 'collision' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Object A</label>
              <select value={objAParam} onChange={e => setObjAParam(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
                {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Object B</label>
              <select value={objBParam} onChange={e => setObjBParam(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
                {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {selectedType === 'check_variable' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <div style={{ flex: 1.5 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Variable Name</label>
              <input type="text" value={varName} onChange={e => setVarName(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Operator</label>
              <select value={varOp} onChange={e => setVarOp(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
                <option value="==">==</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value="!=">!=</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Value</label>
              <input type="number" value={varVal} onChange={e => setVarVal(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button style={{ padding: '6px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} onClick={onClose}>Cancel</button>
          <button className="primary" style={{ padding: '6px 16px' }} onClick={handleSubmit}>Add Condition</button>
        </div>
      </div>
    </div>
  );
}

interface ActionModalProps {
  onAdd: (act: Omit<Action, 'id'>) => void;
  onClose: () => void;
}

export function ActionModal({ onAdd, onClose }: ActionModalProps) {
  const objects = useSceneStore(state => state.objects);
  const [selectedType, setSelectedType] = useState('move');
  
  const [targetObj, setTargetObj] = useState(objects[0]?.id || '');
  const [dx, setDx] = useState(5);
  const [dy, setDy] = useState(0);
  
  const [varName, setVarName] = useState('Score');
  const [varOp, setVarOp] = useState('add');
  const [varVal, setVarVal] = useState(10);
  
  const [angle, setAngle] = useState(45);
  const [colorHex, setColorHex] = useState('#ff0000');

  const handleSubmit = () => {
    if (selectedType === 'move') {
      onAdd({ type: 'move', params: { targetId: targetObj, dx, dy } });
    } else if (selectedType === 'jump') {
      onAdd({ type: 'jump', params: { targetId: targetObj, force: dy || -300 } });
    } else if (selectedType === 'destroy') {
      onAdd({ type: 'destroy', params: { targetId: targetObj } });
    } else if (selectedType === 'camera_follow') {
      onAdd({ type: 'camera_follow', params: { targetId: targetObj } });
    } else if (selectedType === 'set_variable') {
      onAdd({ type: 'set_variable', params: { varName, operator: varOp, value: varVal } });
    } else if (selectedType === 'rotate_object') {
      onAdd({ type: 'rotate_object', params: { targetId: targetObj, angle } });
    } else if (selectedType === 'set_color') {
      onAdd({ type: 'set_color', params: { targetId: targetObj, color: colorHex } });
    }
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 500, background: 'var(--bg-surface-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Add Action</h3>
          <button className="icon-btn" onClick={onClose} style={{ padding: 0 }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Action Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
            <option value="move">Transform: Move Object</option>
            <option value="rotate_object">Transform: Rotate Object</option>
            <option value="jump">Physics: Jump (Apply upwards force)</option>
            <option value="set_color">Visual: Set Object Color</option>
            <option value="destroy">Lifecycle: Destroy Object</option>
            <option value="camera_follow">Scene: Camera Follow Object</option>
            <option value="set_variable">Logic: Set Global Variable</option>
          </select>
        </div>

        {['move', 'jump', 'destroy', 'camera_follow', 'rotate_object', 'set_color'].includes(selectedType) && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Target Object</label>
            <select value={targetObj} onChange={e => setTargetObj(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
              {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
        )}

        {selectedType === 'move' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Speed X</label>
              <input type="number" value={dx} onChange={e => setDx(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Speed Y</label>
              <input type="number" value={dy} onChange={e => setDy(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
            </div>
          </div>
        )}

        {selectedType === 'rotate_object' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Angle (Degrees to add)</label>
            <input type="number" value={angle} onChange={e => setAngle(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
          </div>
        )}
        
        {selectedType === 'set_color' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Hex Color</label>
            <input type="color" value={colorHex} onChange={e => setColorHex(e.target.value)} style={{ width: '100%', padding: 4, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 4 }} />
          </div>
        )}

        {selectedType === 'jump' && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Jump Force (negative Y)</label>
            <input type="number" value={dy} onChange={e => setDy(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} placeholder="-300" />
          </div>
        )}

        {selectedType === 'set_variable' && (
           <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-end' }}>
             <div style={{ flex: 1.5 }}>
               <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Variable Name</label>
               <input type="text" value={varName} onChange={e => setVarName(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
             </div>
             <div style={{ flex: 1 }}>
               <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Operation</label>
               <select value={varOp} onChange={e => setVarOp(e.target.value)} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }}>
                 <option value="set">=</option>
                 <option value="add">+=</option>
                 <option value="subtract">-='</option>
               </select>
             </div>
             <div style={{ flex: 1 }}>
               <label style={{ display: 'block', fontSize: 13, marginBottom: 8, color: 'var(--text-muted)' }}>Value</label>
               <input type="number" value={varVal} onChange={e => setVarVal(Number(e.target.value))} style={{ width: '100%', padding: 8, background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} />
             </div>
           </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          <button style={{ padding: '6px 16px', background: 'transparent', border: '1px solid var(--border)', color: 'white', borderRadius: 4 }} onClick={onClose}>Cancel</button>
          <button className="primary" style={{ padding: '6px 16px' }} onClick={handleSubmit}>Add Action</button>
        </div>
      </div>
    </div>
  );
}

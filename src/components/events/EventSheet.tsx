import { useState } from 'react';
import { useSceneStore } from '../../store/sceneStore';
import { Plus, Trash, ChevronRight, Play, X } from 'lucide-react';
import { ConditionModal, ActionModal } from './EventModals';

export function EventSheet() {
  const { events, addEventBlock, removeEventBlock, addCondition, addAction, removeCondition, removeAction, objects, assets } = useSceneStore();

  const [activeConditionBlockId, setActiveConditionBlockId] = useState<string | null>(null);
  const [activeActionBlockId, setActiveActionBlockId] = useState<string | null>(null);

  const getObjectName = (id: string) => objects.find(o => o.id === id)?.name || id;
  const getAssetName = (id: string) => assets.find(a => a.id === id)?.name || id;

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', paddingBottom: 120 }}>
      
      {activeConditionBlockId && (
        <ConditionModal 
          onAdd={(cond) => addCondition(activeConditionBlockId, cond)} 
          onClose={() => setActiveConditionBlockId(null)} 
        />
      )}
      
      {activeActionBlockId && (
        <ActionModal 
          onAdd={(act) => addAction(activeActionBlockId, act)} 
          onClose={() => setActiveActionBlockId(null)} 
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>Event Sheet</h2>
        <button className="primary" onClick={addEventBlock}>
          <Plus size={16} /> Add New Event Block
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {events.map((block, index) => (
          <div key={block.id} style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
            
            <div style={{ width: 40, background: 'var(--bg-surface-elevated)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{index + 1}</span>
            </div>

            <div style={{ flex: 1, borderRight: '1px solid var(--border)', padding: 12, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, right: -1, width: 2, background: 'var(--border)' }}></div>
              
              {block.conditions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>No conditions (Always)</div>
              ) : (
                block.conditions.map(cond => (
                  <div key={cond.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 8px', background: 'var(--bg-base)', borderRadius: 4, border: '1px solid var(--border-light)' }}>
                    <ChevronRight size={14} color="var(--warning)" />
                    <span style={{ fontSize: 13 }}>
                      {cond.type === 'always' && 'Always (Every frame)'}
                      {cond.type === 'keyboard_pressed' && `Key [${cond.params.key}] is pressed`}
                      {cond.type === 'mouse_clicked' && `Mouse [${cond.params.button}] clicked`}
                      {cond.type === 'collision' && `Collision between ${getObjectName(cond.params.objA)} and ${getObjectName(cond.params.objB)}`}
                      {cond.type === 'check_variable' && `If ${cond.params.varName} ${cond.params.operator} ${cond.params.value}`}
                    </span>
                    <button className="icon-btn" style={{ marginLeft: 'auto', padding: 2 }} onClick={() => removeCondition(block.id, cond.id)}>
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}

              <button style={{ fontSize: 12, padding: '4px 8px', color: 'var(--primary)', marginTop: 8 }} onClick={() => setActiveConditionBlockId(block.id)}>
                + Add Condition
              </button>
            </div>

            <div style={{ flex: 1.5, padding: 12 }}>
              {block.actions.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic', marginBottom: 8 }}>No actions</div>
              ) : (
                block.actions.map(act => (
                  <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '6px 8px', background: 'var(--bg-base)', borderRadius: 4, border: '1px solid var(--border-light)' }}>
                    <Play size={14} color="var(--success)" />
                    <span style={{ fontSize: 13 }}>
                      {act.type === 'move' && `Move ${getObjectName(act.params.targetId)} by X:${act.params.dx} Y:${act.params.dy}`}
                      {act.type === 'jump' && `Apply ${act.params.force} vertical force to ${getObjectName(act.params.targetId)}`}
                      {act.type === 'camera_follow' && `Camera follows ${getObjectName(act.params.targetId)}`}
                      {act.type === 'rotate_object' && `Rotate ${getObjectName(act.params.targetId)} by ${act.params.angle}°`}
                      {act.type === 'set_color' && `Set ${getObjectName(act.params.targetId)} color to ${act.params.color}`}
                      {act.type === 'set_variable' && `${act.params.operator === 'set' ? 'Set' : act.params.operator === 'add' ? 'Add' : 'Subtract'} ${act.params.value} ${act.params.operator === 'set' ? 'to' : 'from'} variable ${act.params.varName}`}
                      {act.type === 'destroy' && `Destroy ${getObjectName(act.params.targetId)}`}
                      {act.type === 'spawn_at_mouse' && `Spawn ${getAssetName(act.params.textureId)} at mouse position ${act.params.snapToGrid ? '(Snap to Grid)' : ''}`}
                      {act.type === 'destroy_at_mouse' && `Mine block at mouse position`}
                      {act.type === 'generate_endless_terrain' && `Procedurally Generate Minecraft Terrain`}
                    </span>
                    <button className="icon-btn" style={{ marginLeft: 'auto', padding: 2 }} onClick={() => removeAction(block.id, act.id)}>
                      <Trash size={12} color="var(--text-muted)" />
                    </button>
                  </div>
                ))
              )}

              <button style={{ fontSize: 12, padding: '4px 8px', color: 'var(--primary)', marginTop: 8 }} onClick={() => setActiveActionBlockId(block.id)}>
                + Add Action
              </button>
            </div>

            <div style={{ width: 40, borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <button className="icon-btn" style={{ padding: 4 }} onClick={() => removeEventBlock(block.id)}>
                 <Trash size={14} color="var(--error)" />
               </button>
            </div>

          </div>
        ))}
        
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <p>Your event sheet is empty.</p>
            <p style={{ fontSize: 13, marginTop: 8 }}>Click "Add New Event Block" to create your first rule.</p>
          </div>
        )}
      </div>
    </div>
  );
}

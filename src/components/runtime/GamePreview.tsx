import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useSceneStore } from '../../store/sceneStore';
import { PlaySquare } from 'lucide-react';

export function GamePreview() {
  const { objects, events, assets, globalVariables, setGlobalVariable, setIsPlaying } = useSceneStore();
  const gameRef = useRef<Phaser.Game | null>(null);
  
  // Create a ref to store a mutable copy of the variables for the game loop
  const varsRef = useRef({ ...globalVariables });

  useEffect(() => {
    varsRef.current = { ...globalVariables };
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: 'phaser-container',
      backgroundColor: '#87CEEB',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 800, x: 0 },
          debug: false
        }
      },
      scene: {
        preload: function(this: Phaser.Scene) {
          assets.forEach(asset => {
            this.load.image(asset.id, asset.dataUrl);
          });
        },
        create: function(this: Phaser.Scene) {
          this.input.mouse?.disableContextMenu();
          
          this.registry.set('game_objects', {});
          this.registry.set('camera_target', null);
          
          this.physics.world.setBounds(0, 0, 4000, 2000);
          this.cameras.main.setBounds(0, 0, 4000, 2000);

          const dynGroup = this.physics.add.group();
          const statGroup = this.physics.add.staticGroup();

          const sprites: Record<string, Phaser.GameObjects.GameObject> = {};

          objects.forEach(obj => {
            let phaserObj: any;
            
            if (obj.type === 'text') {
              phaserObj = this.add.text(obj.x, obj.y, obj.name, { color: obj.color, fontSize: '24px', fontFamily: 'Inter', fontStyle: 'bold' });
              phaserObj.setOrigin(0.5);
              statGroup.add(phaserObj);
            } 
            else if (obj.type === 'sprite' && obj.textureId) {
              phaserObj = this.physics.add.sprite(obj.x, obj.y, obj.textureId);
              phaserObj.setDisplaySize(obj.width, obj.height);
            } 
            else {
              const hexColor = parseInt(obj.color.replace('#', ''), 16);
              if (obj.type === 'circle') {
                phaserObj = this.add.circle(obj.x, obj.y, obj.width / 2, hexColor);
              } else {
                phaserObj = this.add.rectangle(obj.x, obj.y, obj.width, obj.height, hexColor);
              }
            }

            const isStatic = obj.width > 400 || obj.y >= 200 || obj.type === 'text';
            
            if (isStatic && obj.type !== 'text') {
              statGroup.add(phaserObj);
              if (phaserObj.body) phaserObj.body.updateFromGameObject();
            } else if (!isStatic && obj.type !== 'text') {
              dynGroup.add(phaserObj);
              if (phaserObj.body) {
                if (obj.type === 'sprite' && obj.textureId) {
                   phaserObj.body.setSize(32, 32);
                }
                (phaserObj.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
              }
            }

            sprites[obj.id] = phaserObj;
          });

          this.physics.add.collider(dynGroup, statGroup);
          this.physics.add.collider(dynGroup, dynGroup);

          this.registry.set('dyn_group', dynGroup);
          this.registry.set('stat_group', statGroup);
          this.registry.set('game_objects', sprites);

          const keys: Record<string, Phaser.Input.Keyboard.Key> = {};
          events.forEach(evtBlock => {
            evtBlock.conditions.forEach(cond => {
              if (cond.type === 'keyboard_pressed') {
                let keyName = cond.params.key.toUpperCase();
                if (keyName === 'ARROWRIGHT') keyName = 'RIGHT';
                if (keyName === 'ARROWLEFT') keyName = 'LEFT';
                if (keyName === 'ARROWUP') keyName = 'UP';
                if (keyName === 'ARROWDOWN') keyName = 'DOWN';
                if (keyName === 'SPACE') keyName = 'SPACE';
                
                if (!keys[keyName] && this.input.keyboard) {
                  keys[keyName] = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[keyName as keyof typeof Phaser.Input.Keyboard.KeyCodes]);
                }
              }
            });
          });
          this.registry.set('keys', keys);
        },
        update: function(this: Phaser.Scene) {
          const sprites = this.registry.get('game_objects');
          const keys = this.registry.get('keys');

          const pointerLeft = this.input.activePointer.isDown && this.input.activePointer.button === 0;
          const pointerRight = this.input.activePointer.isDown && this.input.activePointer.button === 2;

          // Update text objects linked to variables
          Object.keys(sprites).forEach(key => {
            const spr = sprites[key] as any;
            if (spr && spr.type === 'Text') {
              if (spr.text.startsWith('Score:')) {
                spr.setText(`Score: ${varsRef.current.Score}`);
              }
            }
          });

          events.forEach(evtBlock => {
            let conditionsMet = true;
            if (evtBlock.conditions.length === 0) conditionsMet = true;

            evtBlock.conditions.forEach(cond => {
              if (cond.type === 'always') {} 
              else if (cond.type === 'keyboard_pressed') {
                let keyName = cond.params.key.toUpperCase();
                if (keyName === 'ARROWRIGHT') keyName = 'RIGHT';
                if (keyName === 'ARROWLEFT') keyName = 'LEFT';
                if (keyName === 'ARROWUP') keyName = 'UP';
                if (keyName === 'ARROWDOWN') keyName = 'DOWN';
                
                const keyObj = keys[keyName];
                if (!keyObj || !keyObj.isDown) conditionsMet = false;
              }
              else if (cond.type === 'mouse_clicked') {
                 if (cond.params.button === 'left' && !pointerLeft) conditionsMet = false;
                 if (cond.params.button === 'right' && !pointerRight) conditionsMet = false;
              }
              else if (cond.type === 'check_variable') {
                const currentVal = varsRef.current[cond.params.varName] || 0;
                const targetVal = cond.params.value;
                if (cond.params.operator === '==') {
                  if (currentVal !== targetVal) conditionsMet = false;
                } else if (cond.params.operator === '>') {
                  if (!(currentVal > targetVal)) conditionsMet = false;
                } else if (cond.params.operator === '<') {
                  if (!(currentVal < targetVal)) conditionsMet = false;
                } else if (cond.params.operator === '!=') {
                  if (currentVal === targetVal) conditionsMet = false;
                }
              }
              else if (cond.type === 'collision') {
                const objA = sprites[cond.params.objA];
                const objB = sprites[cond.params.objB];
                if (objA && objB && objA.active && objB.active) {
                  const boundsA = (objA as any).getBounds();
                  const boundsB = (objB as any).getBounds();
                  if (!Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB)) {
                    conditionsMet = false;
                  }
                } else conditionsMet = false;
              }
            });

            if (conditionsMet) {
              evtBlock.actions.forEach(act => {
                if (act.type === 'set_variable') {
                  const varName = act.params.varName;
                  const currentVal = varsRef.current[varName] || 0;
                  if (act.params.operator === 'set') {
                    varsRef.current[varName] = act.params.value;
                  } else if (act.params.operator === 'add') {
                    varsRef.current[varName] = currentVal + act.params.value;
                  } else if (act.params.operator === 'subtract') {
                    varsRef.current[varName] = currentVal - act.params.value;
                  }
                  // We update the react store too, but only occasionally or when stopping so we don't spam react state.
                  // For now, doing it inside the phaser loop is fine but bad for performance. 
                  // We rely on the varsRef for instant phaser logic updates.
                }
                else {
                  const target = sprites[act.params.targetId] as any;
                  if (!target || !target.active) return;

                  if (act.type === 'camera_follow') {
                    if (this.registry.get('camera_target') !== target) {
                       this.registry.set('camera_target', target);
                       this.cameras.main.startFollow(target, true, 0.1, 0.1);
                    }
                  }
                  else if (act.type === 'move') {
                    if (target.body && 'setVelocityX' in target) {
                      target.x += act.params.dx;
                      (target.body as Phaser.Physics.Arcade.Body).setVelocityX(act.params.dx * 60);
                    } else {
                      target.x += act.params.dx;
                      target.y += act.params.dy;
                    }
                  }
                  else if (act.type === 'jump') {
                    const body = target.body as Phaser.Physics.Arcade.Body;
                    if (body && (body.touching.down || body.blocked.down)) {
                      body.setVelocityY(act.params.force || -400);
                    }
                  }
                  else if (act.type === 'rotate_object') {
                    target.angle += act.params.angle;
                  }
                  else if (act.type === 'set_color') {
                    const hex = parseInt(act.params.color.replace('#', ''), 16);
                    if (target.setFillStyle) {
                      target.setFillStyle(hex);
                    } else if (target.setTint) {
                      target.setTint(hex);
                    }
                  }
                  else if (act.type === 'destroy') {
                    target.destroy();
                  }
                }
              });
            } else {
               evtBlock.actions.forEach(act => {
                 if (act.type === 'move') {
                    const target = sprites[act.params.targetId] as any;
                    if (target && target.active && target.body && 'setVelocityX' in target) {
                       (target.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
                    }
                 }
               });
            }
          });
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [objects, events, assets, globalVariables]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--success)' }}>
          <PlaySquare size={18} /> Game Preview (Advanced Generic Logic)
        </div>
        <button className="icon-btn" style={{ background: 'var(--error)', color: 'white' }} onClick={() => {
           setGlobalVariable('Score', varsRef.current.Score);
           setIsPlaying(false);
        }}>
          Stop Preview
        </button>
      </div>
      <div id="phaser-container" style={{ flex: 1 }}></div>
    </div>
  );
}

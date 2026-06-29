import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { useSceneStore } from '../../store/sceneStore';
import { PlaySquare } from 'lucide-react';

export function GamePreview() {
  const { objects, code, assets, globalVariables, setGlobalVariable, setIsPlaying } = useSceneStore();
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
            sprites[obj.name] = phaserObj; // Expose to code by name too
          });

          this.physics.add.collider(dynGroup, statGroup);
          this.physics.add.collider(dynGroup, dynGroup);

          this.registry.set('dyn_group', dynGroup);
          this.registry.set('stat_group', statGroup);
          this.registry.set('game_objects', sprites);

          // Keyboard setup
          const keys: Record<string, Phaser.Input.Keyboard.Key> = {};
          if (this.input.keyboard) {
            keys.UP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
            keys.DOWN = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
            keys.LEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
            keys.RIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
            keys.SPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          }
          this.registry.set('keys', keys);

          // Compile User Code
          try {
            // Provide a sandboxed evaluation environment for the update loop
            const UserScript = new Function('scene', 'objects', 'variables', 'keys', code + '\nreturn typeof update !== "undefined" ? update : null;');
            const updateFn = UserScript(this, sprites, varsRef.current, keys);
            this.registry.set('user_update', updateFn);
          } catch (e) {
            console.error("Error compiling A# code:", e);
          }
        },
        update: function(this: Phaser.Scene) {
          const sprites = this.registry.get('game_objects');
          const userUpdate = this.registry.get('user_update');

          // Update text objects linked to variables (auto-binding)
          Object.keys(sprites).forEach(key => {
            const spr = sprites[key] as any;
            if (spr && spr.type === 'Text') {
              if (spr.text.startsWith('Score:')) {
                spr.setText(`Score: ${varsRef.current.Score}`);
              }
            }
          });

          // Run User Code loop
          if (typeof userUpdate === 'function') {
            try {
              userUpdate();
            } catch (e) {
              console.error("Error executing A# code:", e);
            }
          }
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, [objects, code, assets, globalVariables]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--success)' }}>
          <PlaySquare size={18} /> Game Preview (A# Execution)
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

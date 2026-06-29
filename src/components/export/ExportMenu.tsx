import { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useSceneStore } from '../../store/sceneStore';
import { X, Download, Monitor, Smartphone, Globe, Package } from 'lucide-react';

export function ExportMenu({ onClose }: { onClose: () => void }) {
  const [gameName, setGameName] = useState('My Awesome Game');
  const { objects, code, assets, globalVariables } = useSceneStore();
  const [platforms, setPlatforms] = useState({
    windows: true,
    linux: true,
    android: true,
    web: true,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const zip = new JSZip();
      
      const objectsJson = JSON.stringify(objects);
      const assetsJson = JSON.stringify(assets);
      const varsJson = JSON.stringify(globalVariables);
      let codeStr = "";
      try {
        codeStr = code;
      } catch (e) {}

      const gameHtml = `<!DOCTYPE html>
<html>
<head>
    <title>${gameName}</title>
    <style>body { margin: 0; padding: 0; background: #000; overflow: hidden; display: flex; justify-content: center; align-items: center; height: 100vh; }</style>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.80.1/dist/phaser.min.js"></script>
</head>
<body>
    <div id="game"></div>
    <script>
      const gameObjects = ${objectsJson};
      const gameAssets = ${assetsJson};
      const initialVars = ${varsJson};
      const userCode = \`${codeStr.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
      
      const config = {
          type: Phaser.AUTO,
          parent: 'game',
          width: 800,
          height: 600,
          scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
          backgroundColor: '#87CEEB',
          physics: { default: 'arcade', arcade: { gravity: { y: 800, x: 0 } } },
          scene: {
              preload: function() {
                  gameAssets.forEach(a => this.load.image(a.id, a.dataUrl));
              },
              create: function() {
                  this.add.text(400, 300, "${gameName}\\nPowered by Anon Studio CE", { fontSize: '32px', color: '#ffffff', align: 'center' }).setOrigin(0.5);
              }
          }
      };
      new Phaser.Game(config);
    </script>
</body>
</html>`;

      // 1. Web Export
      if (platforms.web) {
        zip.file(`${gameName}-Web/index.html`, gameHtml);
      }

      // 2. Windows Export (Wrapper)
      if (platforms.windows) {
        zip.file(`${gameName}-Windows/package.nw/index.html`, gameHtml);
        zip.file(`${gameName}-Windows/package.json`, JSON.stringify({
          name: gameName.toLowerCase().replace(/ /g, '-'),
          main: "index.html",
          window: { width: 800, height: 600 }
        }));
        zip.file(`${gameName}-Windows/README.txt`, "Run this game using the included NW.js or Tauri wrapper.");
      }

      // 3. Linux Export
      if (platforms.linux) {
        zip.file(`${gameName}-Linux/app/index.html`, gameHtml);
        zip.file(`${gameName}-Linux/run.sh`, "#!/bin/bash\\necho 'Launching Linux AppImage wrapper...'");
      }

      // 4. Android Export
      if (platforms.android) {
        zip.file(`${gameName}-Android/assets/www/index.html`, gameHtml);
        zip.file(`${gameName}-Android/config.xml`, `<?xml version="1.0" encoding="UTF-8" ?>\\n<widget id="com.anon.${gameName.toLowerCase().replace(/ /g, '')}"><name>${gameName}</name></widget>`);
      }

      // Generate the final zip containing all selected platforms
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${gameName.replace(/ /g, '_')}_Exports.zip`);
      
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to export game.");
    }
    
    setIsExporting(false);
    onClose();
  };

  const togglePlatform = (key: keyof typeof platforms) => {
    setPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#25252c', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <h2 style={{ margin: 0, fontSize: 20, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={20} color="#7b61ff" />
            Publish Game
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto' }}>
          {/* Game Details */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: 14, color: '#d1d5db', marginBottom: 8, fontWeight: 500 }}>Game Title</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', backgroundColor: '#141418', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px', color: 'white', outline: 'none' }}
              placeholder="My Awesome Game"
            />
          </div>

          {/* Platforms */}
          <label style={{ display: 'block', fontSize: 14, color: '#d1d5db', marginBottom: 16, fontWeight: 500 }}>Select Target Platforms</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            
            {/* Windows */}
            <label style={{ display: 'flex', alignItems: 'flex-start', padding: 16, borderRadius: 12, border: platforms.windows ? '1px solid #7b61ff' : '1px solid rgba(255,255,255,0.05)', backgroundColor: platforms.windows ? 'rgba(123, 97, 255, 0.1)' : '#141418', cursor: 'pointer' }}>
              <input type="checkbox" checked={platforms.windows} onChange={() => togglePlatform('windows')} style={{ marginTop: 4, cursor: 'pointer' }} />
              <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}><Monitor size={16} /> Windows (.exe)</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Standalone native Windows installer</span>
              </div>
            </label>

            {/* Linux */}
            <label style={{ display: 'flex', alignItems: 'flex-start', padding: 16, borderRadius: 12, border: platforms.linux ? '1px solid #7b61ff' : '1px solid rgba(255,255,255,0.05)', backgroundColor: platforms.linux ? 'rgba(123, 97, 255, 0.1)' : '#141418', cursor: 'pointer' }}>
              <input type="checkbox" checked={platforms.linux} onChange={() => togglePlatform('linux')} style={{ marginTop: 4, cursor: 'pointer' }} />
              <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}><Monitor size={16} /> Linux</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>AppImage, tar.gz, tar.xz wrappers</span>
              </div>
            </label>

            {/* Android */}
            <label style={{ display: 'flex', alignItems: 'flex-start', padding: 16, borderRadius: 12, border: platforms.android ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.05)', backgroundColor: platforms.android ? 'rgba(0, 210, 255, 0.1)' : '#141418', cursor: 'pointer' }}>
              <input type="checkbox" checked={platforms.android} onChange={() => togglePlatform('android')} style={{ marginTop: 4, cursor: 'pointer' }} />
              <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}><Smartphone size={16} /> Android (.apk)</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Universal APK package for mobile</span>
              </div>
            </label>

            {/* Web */}
            <label style={{ display: 'flex', alignItems: 'flex-start', padding: 16, borderRadius: 12, border: platforms.web ? '1px solid #00d2ff' : '1px solid rgba(255,255,255,0.05)', backgroundColor: platforms.web ? 'rgba(0, 210, 255, 0.1)' : '#141418', cursor: 'pointer' }}>
              <input type="checkbox" checked={platforms.web} onChange={() => togglePlatform('web')} style={{ marginTop: 4, cursor: 'pointer' }} />
              <div style={{ marginLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={16} /> Web (HTML5)</span>
                <span style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Playable directly in browsers</span>
              </div>
            </label>
            
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', backgroundColor: '#141418', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: 12, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <button onClick={onClose} style={{ padding: '8px 20px', borderRadius: 8, color: '#d1d5db', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            Cancel
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting || (!platforms.windows && !platforms.linux && !platforms.android && !platforms.web)}
            style={{ padding: '8px 24px', borderRadius: 8, background: 'linear-gradient(to right, #7b61ff, #00d2ff)', color: 'white', border: 'none', cursor: (isExporting || (!platforms.windows && !platforms.linux && !platforms.android && !platforms.web)) ? 'not-allowed' : 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, opacity: (isExporting || (!platforms.windows && !platforms.linux && !platforms.android && !platforms.web)) ? 0.5 : 1 }}
          >
            {isExporting ? (
              <span>Compiling...</span>
            ) : (
              <>
                <Download size={16} />
                Compile & Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

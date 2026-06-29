import Editor from '@monaco-editor/react';
import { useSceneStore } from '../../store/sceneStore';
import { Terminal } from 'lucide-react';

export function CodeEditor() {
  const { code, setCode } = useSceneStore();

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  return (
    <main className="workspace" style={{ flexDirection: 'column' }}>
      <div className="panel-header" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface-elevated)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Terminal size={18} color="#7b61ff" />
        <span style={{ fontWeight: 600, fontSize: 14 }}>A# / JavaScript Game Script</span>
      </div>
      <div style={{ flex: 1, backgroundColor: '#1e1e1e' }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            padding: { top: 20 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
          }}
        />
      </div>
    </main>
  );
}

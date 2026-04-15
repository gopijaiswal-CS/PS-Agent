import { FC, useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { adminApi } from '@/api/admin.api';
import { Button } from './Button';

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const RichEditor: FC<RichEditorProps> = ({ content, onChange, placeholder = 'Write your content here...', readOnly = false }) => {
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      // Return HTML to parant
      onChange(editor.getHTML());
    },
  });

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      // In a real scenario, you'd have a specific /api/upload/file endpoint
      // We will use the existing uploadImage for now
      const res = await adminApi.uploadImage(file);
      const url = res.data.data.url;

      // If it's an image, embed it. If it's a PDF, create a link.
      if (file.type.startsWith('image/')) {
        editor.chain().focus().setImage({ src: url }).run();
      } else {
        editor.chain().focus().setLink({ href: url }).insertContent(`📄 Download: ${file.name}`).run();
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
      alert('Failed to upload. Ensure the file is valid and backend running.');
    } finally {
      setUploading(false);
      if (event.target) event.target.value = ''; // reset input
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-theme/20 rounded-lg overflow-hidden bg-theme-elevated/30 flex flex-col">
      {!readOnly && (
        <div className="bg-theme-bg/50 px-3 py-2 flex items-center flex-wrap gap-1 border-b border-theme/20 sticky top-0 z-10 backdrop-blur-sm">
          <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('paragraph') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>P</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>H1</button>
          <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>H2</button>
          <div className="w-px h-4 bg-theme-muted/30 mx-1" />
          <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-xs font-bold rounded transition-colors ${editor.isActive('bold') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>B</button>
          <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-xs italic rounded transition-colors ${editor.isActive('italic') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>I</button>
          <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`px-2 py-1 text-xs font-mono rounded transition-colors ${editor.isActive('code') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>{`</>`}</button>
          <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 text-xs font-mono rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/30' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>Code Block</button>
          <div className="w-px h-4 bg-theme-muted/30 mx-1" />
          <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('bulletList') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>• List</button>
          <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-xs rounded transition-colors ${editor.isActive('orderedList') ? 'bg-theme/10 text-theme' : 'text-theme-muted hover:text-theme-secondary hover:bg-theme/5'}`}>1. List</button>
          <div className="w-px h-4 bg-theme-muted/30 mx-1" />
          
          <label className="relative cursor-pointer group flex items-center justify-center">
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf,.doc,.docx" disabled={uploading} />
            <div className={`px-2 py-1 text-xs rounded flex items-center gap-1 transition-colors ${uploading ? 'text-theme-accent opacity-50' : 'text-theme-muted hover:bg-theme/10 hover:text-theme-accent'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {uploading ? 'Uploading...' : 'File / Image'}
            </div>
          </label>
        </div>
      )}
      <div className="p-4 prose prose-invert max-w-none text-theme min-h-[250px] focus:outline-none tiptap-content marker:text-theme-accent prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-theme/20 prose-pre:text-theme-secondary prose-code:text-theme-accent prose-code:bg-theme-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-a:text-theme-accent prose-headings:text-theme prose-strong:text-theme">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

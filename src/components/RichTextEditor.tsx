import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Escreva seu conteúdo aqui...",
  height = 400 
}: RichTextEditorProps) {
  const editorRef = useRef<any>(null);

  return (
    <div className="border rounded-md">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        init={{
          height: height,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          placeholder: placeholder,
          skin: 'oxide',
          content_css: 'default',
          branding: false,
        }}
        onEditorChange={(content) => onChange(content)}
      />
    </div>
  );
}
import React, { useEffect, useRef } from "react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const editorConfig = {
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "bulletedList",
    "numberedList",
    "|",
    "blockQuote",
    "insertTable",
    "undo",
    "redo",
  ],
};

const setEditorReadOnly = (editor, readOnly) => {
  if (editor.enableReadOnlyMode && editor.disableReadOnlyMode) {
    if (readOnly) {
      editor.enableReadOnlyMode("legal-content-editor");
    } else if (editor.isReadOnly) {
      editor.disableReadOnlyMode("legal-content-editor");
    }
    return;
  }

  editor.isReadOnly = readOnly;
};

const RichTextEditor = ({ value = "", onChange, disabled = false }) => {
  const editorElementRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const initialValueRef = useRef(value);
  const initialDisabledRef = useRef(disabled);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    ClassicEditor.create(editorElementRef.current, editorConfig)
      .then((editor) => {
        if (!mounted) {
          editor.destroy();
          return;
        }

        editorInstanceRef.current = editor;
        editor.setData(initialValueRef.current || "");
        setEditorReadOnly(editor, initialDisabledRef.current);

        editor.model.document.on("change:data", () => {
          onChangeRef.current(editor.getData());
        });
      })
      .catch((error) => {
        console.error("CKEditor initialization failed:", error);
      });

    return () => {
      mounted = false;

      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const editor = editorInstanceRef.current;

    if (editor && value !== editor.getData()) {
      editor.setData(value || "");
    }
  }, [value]);

  useEffect(() => {
    if (editorInstanceRef.current) {
      setEditorReadOnly(editorInstanceRef.current, disabled);
    }
  }, [disabled]);

  return (
    <div className="legal-rich-editor">
      <div ref={editorElementRef} />
    </div>
  );
};

export default RichTextEditor;

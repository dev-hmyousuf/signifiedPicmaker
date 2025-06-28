import { useState, useCallback } from 'react';

export interface EditorState {
  selectedAsset: string | null;
  assets: Array<{
    id: string;
    type: 'glasses' | 'headphones';
    url: string;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    opacity: number;
    zIndex: number;
  }>;
}

const INITIAL_STATE: EditorState = {
  selectedAsset: null,
  assets: []
};

export const useEditorHistory = () => {
  const [history, setHistory] = useState<EditorState[]>([INITIAL_STATE]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];

  const pushState = useCallback((newState: EditorState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size to prevent memory issues
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  const reset = useCallback(() => {
    setHistory([INITIAL_STATE]);
    setCurrentIndex(0);
  }, []);

  return {
    state: currentState,
    pushState,
    undo,
    redo,
    reset,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1
  };
};
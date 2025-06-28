import { Download } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import athex from "../public/athex.jpeg";
import Signify from "../public/signify.jpg";
import ControlPanel from "./components/ControlPanel";
import ImageUpload from "./components/ImageUpload";
import PhotoEditor from "./components/PhotoEditor";
import { useFaceDetection } from "./hooks/useFaceDetection";
export interface EditorState {
  image: string | null;
  glasses: {
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    opacity: number;
    visible: boolean;
  };
  faceDetected: boolean;
  facePosition: { x: number; y: number; width: number; height: number } | null;
}

function App() {
  const [editorState, setEditorState] = useState<EditorState>({
    image: null,
    glasses: {
      position: { x: 300, y: 200 },
      scale: 1,
      rotation: 0,
      opacity: 1,
      visible: false,
    },
    faceDetected: false,
    facePosition: null,
  });

  const [isExporting, setIsExporting] = useState(false);
  const editorRef = useRef<any>(null);
  const { detectFace, isLoading: faceDetectionLoading } = useFaceDetection();

  const handleImageUpload = useCallback(
    async (imageUrl: string) => {
      setEditorState((prev) => ({
        ...prev,
        image: imageUrl,
        glasses: { ...prev.glasses, visible: false },
      }));

      // Detect face after image upload
      try {
        const faceData = await detectFace(imageUrl);
        if (faceData) {
          setEditorState((prev) => ({
            ...prev,
            faceDetected: true,
            facePosition: faceData,
            glasses: {
              ...prev.glasses,
              position: {
                x: faceData.x + faceData.width / 2,
                y: faceData.y + faceData.height * 0.4,
              },
              visible: true,
            },
          }));
        }
      } catch (error) {
        console.error("Face detection failed:", error);
      }
    },
    [detectFace]
  );

  const handleGlassesUpdate = useCallback(
    (updates: Partial<EditorState["glasses"]>) => {
      setEditorState((prev) => ({
        ...prev,
        glasses: { ...prev.glasses, ...updates },
      }));
    },
    []
  );

  const handleAddGlasses = useCallback(() => {
    setEditorState((prev) => ({
      ...prev,
      glasses: { ...prev.glasses, visible: true },
    }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!editorRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await editorRef.current.exportImage();

      const link = document.createElement("a");
      link.download = "signglasses-photo.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setEditorState({
      image: null,
      glasses: {
        position: { x: 300, y: 200 },
        scale: 1,
        rotation: 0,
        opacity: 1,
        visible: false,
      },
      faceDetected: false,
      facePosition: null,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Images */}
          <button
            onClick={handleReset}
            className="flex items-center space-x-3 text-white hover:text-orange-200 transition-colors"
            aria-label="Reset editor"
          >
            <div className="flex overflow-hidden rounded-lg border-2 border-orange-500 shadow-lg">
              <img
                src={Signify}
                alt="Signify"
                className="h-16 w-16 object-cover"
                draggable={false}
              />
              <img
                src={athex}
                alt="Athex"
                className="h-16 w-16 object-cover"
                draggable={false}
              />
            </div>
          </button>

          {/* Center: Title */}
          <h1 className="text-white text-xl font-semibold absolute left-1/2 transform -translate-x-1/2 pointer-events-none select-none">
            Signify Glass Maker
          </h1>

          {/* Right: Download button */}
          {editorState.image && (
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <Download className="w-5 h-5" />
              
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4">
        {!editorState.image ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
            <div className="text-center mb-8">
              <div className="w-16 h-16rounded-full flex items-center justify-center mx-auto mb-4">
                <img className="rounded-l-lg" src={Signify} />
                <span></span>
                <img className="rounded-r-lg" src={athex} />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Signify Glass Maker
              </h1>
              <p className="text-white/80 text-lg">
                Upload your profile picture and put on our Sign Orange
                Sunglasses!
              </p>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Photo Editor */}
            <div className="lg:col-span-3">
              <PhotoEditor
                ref={editorRef}
                editorState={editorState}
                onGlassesUpdate={handleGlassesUpdate}
                faceDetectionLoading={faceDetectionLoading}
              />
            </div>

            {/* Control Panel */}
            <div className="lg:col-span-1">
              <ControlPanel
                editorState={editorState}
                onGlassesUpdate={handleGlassesUpdate}
                onAddGlasses={handleAddGlasses}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

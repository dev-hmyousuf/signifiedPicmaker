import { fabric } from "fabric";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { EditorState } from "../App";

interface PhotoEditorProps {
  editorState: EditorState;
  onGlassesUpdate: (updates: Partial<EditorState["glasses"]>) => void;
  faceDetectionLoading: boolean;
}

const PhotoEditor = forwardRef<any, PhotoEditorProps>(
  ({ editorState, onGlassesUpdate, faceDetectionLoading }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const backgroundRef = useRef<fabric.Image | null>(null);
    const glassesRef = useRef<fabric.Image | null>(null);

    useImperativeHandle(ref, () => ({
      exportImage: () => {
        if (!fabricRef.current) return "";
        return fabricRef.current.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });
      },
    }));

    // Initialize canvas
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 600,
        backgroundColor: "#f3f4f6",
        selection: false,
      });

      fabricRef.current = canvas;

      return () => {
        canvas.dispose();
        fabricRef.current = null;
      };
    }, []);

    // Load background image
    useEffect(() => {
      if (!fabricRef.current || !editorState.image) return;

      fabric.Image.fromURL(
        editorState.image,
        (img) => {
          const canvas = fabricRef.current!;
          const canvasWidth = canvas.getWidth();
          const canvasHeight = canvas.getHeight();

          // Calculate scale to fit image in canvas while maintaining aspect ratio
          const scale = Math.min(
            canvasWidth / img.width!,
            canvasHeight / img.height!
          );

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: canvasWidth / 2,
            top: canvasHeight / 2,
            originX: "center",
            originY: "center",
            selectable: false,
            evented: false,
          });

          canvas.setBackgroundImage(img, () => {
            canvas.renderAll();
          });

          backgroundRef.current = img;
        },
        {
          crossOrigin: "anonymous",
        }
      );
    }, [editorState.image]);

    // Add/update glasses
    useEffect(() => {
      if (!fabricRef.current || !editorState.glasses.visible) {
        if (glassesRef.current && fabricRef.current) {
          fabricRef.current.remove(glassesRef.current);
          glassesRef.current = null;
        }
        return;
      }

      // REPLACE THIS URL WITH YOUR CUSTOM GLASSES PNG
      // Option 1: Place your PNG in the public folder and reference it like this:
      const customGlassesUrl = "/custom-glasses.png";

      // Option 2: Use an external URL:
      // const customGlassesUrl = 'https://your-domain.com/path-to-your-glasses.png';

      // Option 3: Use a base64 encoded image:
      // const customGlassesUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';

      if (glassesRef.current) {
        // Update existing glasses
        const glasses = glassesRef.current;
        glasses.set({
          left: editorState.glasses.position.x,
          top: editorState.glasses.position.y,
          scaleX: editorState.glasses.scale,
          scaleY: editorState.glasses.scale,
          angle: editorState.glasses.rotation,
          opacity: editorState.glasses.opacity,
        });
        fabricRef.current.renderAll();
      } else {
        // Create new glasses with your custom PNG
        fabric.Image.fromURL(
          customGlassesUrl,
          (img) => {
            img.set({
              left: editorState.glasses.position.x,
              top: editorState.glasses.position.y,
              scaleX: editorState.glasses.scale,
              scaleY: editorState.glasses.scale,
              angle: editorState.glasses.rotation,
              opacity: editorState.glasses.opacity,
              originX: "center",
              originY: "center",
              hasControls: true,
              hasBorders: true,
              cornerStyle: "circle",
              cornerColor: "#f97316",
              cornerStrokeColor: "#ffffff",
              borderColor: "#f97316",
              borderScaleFactor: 2,
              transparentCorners: false,
            });

            fabricRef.current?.add(img);
            glassesRef.current = img;
            fabricRef.current?.renderAll();

            // Handle glasses movement
            img.on("moving", () => {
              onGlassesUpdate({
                position: { x: img.left!, y: img.top! },
              });
            });

            img.on("scaling", () => {
              onGlassesUpdate({
                scale: img.scaleX!,
              });
            });

            img.on("rotating", () => {
              onGlassesUpdate({
                rotation: img.angle!,
              });
            });
          },
          {
            crossOrigin: "anonymous",
          }
        );
      }
    }, [editorState.glasses, onGlassesUpdate]);

    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <div className="w-5 h-5 bg-orange-500 rounded" />
            <span>Photo Editor</span>
          </h2>
          {faceDetectionLoading && (
            <div className="flex items-center space-x-2 text-orange-300">
              <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Detecting face...</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div className="border-2 border-white/30 rounded-lg overflow-hidden shadow-2xl bg-white">
            <canvas
              ref={canvasRef}
              className="block"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/70 text-sm">
            {editorState.faceDetected
              ? "Face detected! Glasses positioned automatically."
              : "Drag and resize the glasses to fit your face."}
          </p>
        </div>
      </div>
    );
  }
);

PhotoEditor.displayName = "PhotoEditor";

export default PhotoEditor;

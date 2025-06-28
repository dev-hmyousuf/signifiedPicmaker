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
    const containerRef = useRef<HTMLDivElement>(null);
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

    // Initialize and resize canvas
    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#f3f4f6",
        selection: false,
        enableRetinaScaling: true,
      });

      fabricRef.current = canvas;

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          canvas.setDimensions({ width, height });
          canvas.renderAll();

          if (backgroundRef.current) {
            const scale = Math.min(
              width / backgroundRef.current.width!,
              height / backgroundRef.current.height!
            );

            backgroundRef.current.set({
              scaleX: scale,
              scaleY: scale,
              left: width / 2,
              top: height / 2,
            });

            canvas.requestRenderAll();
          }

          if (glassesRef.current) {
            glassesRef.current.setCoords();
            canvas.renderAll();
          }
        }
      });

      resizeObserver.observe(container);

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        resizeObserver.disconnect();
      };
    }, []);

    // Load background image
    useEffect(() => {
      if (!fabricRef.current || !editorState.image) return;

      fabric.Image.fromURL(
        editorState.image,
        (img) => {
          const canvas = fabricRef.current!;
          const width = canvas.getWidth();
          const height = canvas.getHeight();

          const scale = Math.min(width / img.width!, height / img.height!);

          img.set({
            scaleX: scale,
            scaleY: scale,
            left: width / 2,
            top: height / 2,
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

      const customGlassesUrl = "/custom-glasses.png";

      if (glassesRef.current) {
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
        fabric.Image.fromURL(
          customGlassesUrl,
          (img) => {
            const canvas = fabricRef.current!;
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();

            // Dynamic default scale (30% of canvas width)
            const targetWidth = canvasWidth;
            const scale = targetWidth / img.width!;

            const posX = editorState.glasses.position.x || canvasWidth / 2;
            const posY = editorState.glasses.position.y || canvasHeight / 2;
            const rotation = editorState.glasses.rotation || 0;
            const opacity =
              editorState.glasses.opacity !== undefined
                ? editorState.glasses.opacity
                : 1;

            img.set({
              left: posX,
              top: posY,
              scaleX: editorState.glasses.scale || scale,
              scaleY: editorState.glasses.scale || scale,
              angle: rotation,
              opacity: opacity,
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

            canvas.add(img);
            glassesRef.current = img;
            canvas.renderAll();

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
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/20 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center space-x-2">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-orange-500 rounded" />
            <span>Photo Editor</span>
          </h2>
          {faceDetectionLoading && (
            <div className="flex items-center space-x-2 text-orange-300 text-sm">
              <div className="w-3 h-3 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
              <span>Detecting face...</span>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="border-2 border-white/30 rounded-lg overflow-hidden shadow-2xl bg-white w-full aspect-square max-w-[600px]"
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>

        <div className="mt-3 md:mt-4 text-center">
          <p className="text-white/70 text-xs md:text-sm">
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

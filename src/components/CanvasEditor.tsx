// Updated CanvasEditor.jsx
import { fabric } from "fabric";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

interface Asset {
  id: string;
  type: "glasses" | "headphones";
  url: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
}

interface CanvasEditorProps {
  backgroundImage: string;
  selectedAsset: string | null;
  onAssetSelect: (id: string | null) => void;
  onAssetUpdate: (id: string, updates: Partial<Asset>) => void;
  onAssetDelete: (id: string) => void;
  assets: Asset[];
}

const CanvasEditor = forwardRef<any, CanvasEditorProps>(
  (
    {
      backgroundImage,
      selectedAsset,
      onAssetSelect,
      onAssetUpdate,
      onAssetDelete,
      assets,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const backgroundRef = useRef<fabric.Image | null>(null);
    const assetsRef = useRef<Map<string, fabric.Image>>(new Map());

    useImperativeHandle(ref, () => ({
      addAsset: (asset: Asset) => {
        addAssetToCanvas(asset);
      },
      removeAsset: (assetId: string) => {
        removeAssetFromCanvas(assetId);
      },
      exportImage: () => {
        if (!fabricRef.current) return "";
        return fabricRef.current.toDataURL({
          format: "png",
          quality: 1,
          multiplier: 2,
        });
      },
      clear: () => {
        if (fabricRef.current) {
          fabricRef.current.clear();
          assetsRef.current.clear();
        }
      },
    }));

    const addAssetToCanvas = (asset: Asset) => {
      if (!fabricRef.current) return;

      fabric.Image.fromURL(
        asset.url,
        (img) => {
          img.set({
            id: asset.id,
            left: asset.position.x,
            top: asset.position.y,
            scaleX: asset.scale,
            scaleY: asset.scale,
            angle: asset.rotation,
            opacity: asset.opacity,
            originX: "center",
            originY: "center",
            hasControls: true,
            hasBorders: true,
            cornerStyle: "circle",
            cornerColor: "#8B5CF6",
            cornerStrokeColor: "#FFFFFF",
            borderColor: "#8B5CF6",
            borderScaleFactor: 2,
            transparentCorners: false,
          });

          fabricRef.current?.add(img);
          assetsRef.current.set(asset.id, img);
          fabricRef.current?.renderAll();
        },
        {
          crossOrigin: "anonymous",
        }
      );
    };

    const removeAssetFromCanvas = (assetId: string) => {
      const asset = assetsRef.current.get(assetId);
      if (asset && fabricRef.current) {
        fabricRef.current.remove(asset);
        assetsRef.current.delete(assetId);
        fabricRef.current.renderAll();
      }
    };

    // Initialize and resize canvas
    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // Initialize fabric canvas
      const canvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor: "#1a1a2e",
        selection: true,
        enableRetinaScaling: true,
      });

      fabricRef.current = canvas;

      // Load background image
      if (backgroundImage) {
        fabric.Image.fromURL(
          backgroundImage,
          (img) => {
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
      }

      // Event handlers
      const handleObjectSelected = (e: fabric.IEvent) => {
        const obj = e.target as any;
        if (obj && obj.id) {
          onAssetSelect(obj.id);
        }
      };

      const handleSelectionCleared = () => {
        onAssetSelect(null);
      };

      const handleObjectModified = (e: fabric.IEvent) => {
        const obj = e.target as any;
        if (obj && obj.id) {
          onAssetUpdate(obj.id, {
            position: { x: obj.left, y: obj.top },
            scale: obj.scaleX,
            rotation: obj.angle,
            opacity: obj.opacity,
          });
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          const activeObject = canvas.getActiveObject() as any;
          if (activeObject && activeObject.id) {
            onAssetDelete(activeObject.id);
          }
        }
      };

      canvas.on("selection:created", handleObjectSelected);
      canvas.on("selection:updated", handleObjectSelected);
      canvas.on("selection:cleared", handleSelectionCleared);
      canvas.on("object:modified", handleObjectModified);
      document.addEventListener("keydown", handleKeyDown);

      // Resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          canvas.setDimensions({ width, height });
          canvas.renderAll();

          // Update background if exists
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
        }
      });

      resizeObserver.observe(container);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        canvas.dispose();
        fabricRef.current = null;
        assetsRef.current.clear();
        resizeObserver.disconnect();
      };
    }, [backgroundImage, onAssetSelect, onAssetUpdate, onAssetDelete]);

    // Update selected asset styling
    useEffect(() => {
      if (!fabricRef.current) return;

      const objects = fabricRef.current.getObjects();
      objects.forEach((obj: any) => {
        if (obj.id) {
          const isSelected = obj.id === selectedAsset;
          obj.set({
            borderColor: isSelected ? "#F59E0B" : "#8B5CF6",
            cornerColor: isSelected ? "#F59E0B" : "#8B5CF6",
          });
        }
      });

      fabricRef.current.renderAll();
    }, [selectedAsset]);

    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-white/10 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center space-x-2">
            <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />
            <span>Canvas</span>
          </h2>
          <div className="text-xs md:text-sm text-white/60">
            Use mouse or touch to manipulate assets
          </div>
        </div>

        <div className="flex justify-center">
          <div
            ref={containerRef}
            className="border-2 border-white/20 rounded-lg overflow-hidden shadow-2xl w-full aspect-square max-w-[600px]"
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>

        <div className="mt-3 md:mt-4 text-center">
          <p className="text-white/50 text-xs md:text-sm">
            Select assets to modify • Press Delete to remove • Drag corners to
            resize
          </p>
        </div>
      </div>
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";

export default CanvasEditor;

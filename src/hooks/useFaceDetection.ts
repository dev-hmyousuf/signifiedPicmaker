import { useCallback, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

export interface FaceDetectionResult {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useFaceDetection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      try {
        // Load face detection models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setIsLoaded(true);
      } catch (error) {
        console.warn('Face detection models failed to load:', error);
        // Continue without face detection
        setIsLoaded(false);
      }
    };

    loadModels();
  }, []);

  const detectFace = useCallback(async (imageUrl: string): Promise<FaceDetectionResult | null> => {
    if (!isLoaded) {
      console.warn('Face detection models not loaded');
      return null;
    }

    setIsLoading(true);
    
    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = async () => {
          try {
            // Detect faces
            const detections = await faceapi
              .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
              .withFaceLandmarks();

            if (detections.length > 0) {
              const detection = detections[0];
              const box = detection.detection.box;
              
              // Scale coordinates to canvas size (600x600)
              const scaleX = 600 / img.width;
              const scaleY = 600 / img.height;
              const scale = Math.min(scaleX, scaleY);
              
              const scaledBox = {
                x: box.x * scale + (600 - img.width * scale) / 2,
                y: box.y * scale + (600 - img.height * scale) / 2,
                width: box.width * scale,
                height: box.height * scale
              };

              resolve(scaledBox);
            } else {
              resolve(null);
            }
          } catch (error) {
            console.error('Face detection error:', error);
            resolve(null);
          } finally {
            setIsLoading(false);
          }
        };

        img.onerror = () => {
          console.error('Failed to load image for face detection');
          setIsLoading(false);
          resolve(null);
        };

        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Face detection failed:', error);
      setIsLoading(false);
      return null;
    }
  }, [isLoaded]);

  return {
    detectFace,
    isLoaded,
    isLoading
  };
};
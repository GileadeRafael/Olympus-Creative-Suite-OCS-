import React, { useState, useRef, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  currentImageUrl?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, currentImageUrl }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(currentImageUrl || null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(e.target.files[0]);
      e.target.value = ''; // Allow selecting the same file again
    }
  };

  const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<{ file: File; url: string }> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.crossOrigin = 'anonymous';
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        canvas.width = 256;
        canvas.height = 256;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          const file = new File([blob], 'avatar.jpeg', { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          resolve({ file, url });
        }, 'image/jpeg');
      };
      image.onerror = (error) => reject(error);
    });
  };
  
  const handleCropAndSave = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const { file, url } = await getCroppedImg(imageSrc, croppedAreaPixels);
        onFileSelect(file);
        setCroppedImage(url);
        setImageSrc(null);
      } catch (e) {
        console.error('Error cropping image:', e);
      }
    }
  };

  const handleCancelCrop = () => {
    setImageSrc(null);
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4">
        <div
          className="w-24 h-24 bg-black/20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer overflow-hidden"
          onClick={() => fileInputRef.current?.click()}
        >
          {croppedImage ? (
            <img src={croppedImage} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center text-white/40 text-xs p-2">
              Click to upload photo
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {imageSrc && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-ocs-dark-sidebar rounded-lg shadow-xl w-full max-w-md border border-white/10">
            <h3 className="text-lg font-semibold text-white p-4 border-b border-white/10">Crop your photo</h3>
            <div className="relative w-full h-80 bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="p-4 flex justify-end space-x-2 bg-black/20 rounded-b-lg">
               <button onClick={handleCancelCrop} className="px-4 py-2 text-sm text-gray-300 bg-ocs-dark-hover rounded-md hover:bg-zinc-700">Cancel</button>
               <button onClick={handleCropAndSave} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600">Save Photo</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploader;
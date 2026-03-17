import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onConfirm: (signatureData: string) => void;
  onDecline?: () => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onConfirm, onDecline }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#2563EB'; // primary-600
      }
    }
  }, []);

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasSignature(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;

    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');

    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.closePath();
      setIsDrawing(false);
    }
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  const handleConfirm = () => {
    if (hasSignature && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onConfirm(dataUrl);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">E-Signature Pad</label>
        <button
          onClick={clearPad}
          className="text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors"
        >
          Clear Pad
        </button>
      </div>

      <div className="relative h-32 bg-white border-2 border-gray-200 rounded-lg overflow-hidden cursor-crosshair">
        {/* Placeholder */}
        {!hasSignature && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200">
              <path d="M12 19l7-7 3 3-7 7-3-3z" />
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              <path d="M2 2l7.586 7.586" />
              <circle cx="11" cy="11" r="2" />
            </svg>
            <p className="text-[10px] text-gray-300 mt-1">Sign within this area using your cursor</p>
          </div>
        )}

        {/* Visual Guide Line */}
        <div className="absolute bottom-5 left-5 right-5 h-px bg-gray-100 pointer-events-none"></div>

        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full touch-none"
        />
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={handleConfirm}
          disabled={!hasSignature}
          className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
            hasSignature
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Confirm Signature
        </button>
        {onDecline && (
          <button
            onClick={onDecline}
            className="px-5 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
        )}
      </div>
    </div>
  );
};

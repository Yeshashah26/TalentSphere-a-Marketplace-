import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

const MAX_MB = 2;

export function readImageAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected'));
      return;
    }
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (JPG, PNG, or WebP).'));
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      reject(new Error(`Image must be smaller than ${MAX_MB}MB.`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image.'));
    reader.readAsDataURL(file);
  });
}

export default function ProfilePhotoUpload({ value, onChange, label = 'Profile Photo' }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      onChange(dataUrl);
    } catch (err) {
      alert(err.message);
    }
    e.target.value = '';
  };

  return (
    <div className="photo-upload">
      <label className="photo-upload-label">{label}</label>
      <div className="photo-upload-row">
        <div className="photo-preview">
          {value ? (
            <img src={value} alt="Profile preview" />
          ) : (
            <span className="photo-placeholder">No photo</span>
          )}
        </div>
        <div className="photo-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="photo-input-hidden"
            onChange={handleFile}
          />
          <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
            <Upload size={16} /> Upload image
          </button>
          {value && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange('')}>
              <X size={16} /> Remove
            </button>
          )}
          <p className="photo-hint">JPG, PNG or WebP. Max {MAX_MB}MB.</p>
        </div>
      </div>
    </div>
  );
}

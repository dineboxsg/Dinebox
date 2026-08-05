import { useId, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MEDIA_BUCKET = 'restaurant-media';

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  restaurantId: string;
  folder: 'logos' | 'covers' | 'posts' | 'deals' | 'menu-items' | 'awards';
  label: string;
  optional?: boolean;
};

export function ImageUpload({ value, onChange, restaurantId, folder, label, optional = false }: ImageUploadProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Images must be 10 MB or smaller.');
      return;
    }

    setUploading(true);
    setError('');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('Your session has expired. Please sign in again before uploading an image.');
      setUploading(false);
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${restaurantId}/${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError(
        uploadError.message.toLowerCase().includes('bucket not found')
          ? 'Image uploads are not configured yet. Please ask a DineBox administrator to deploy the restaurant-media storage migration.'
          : uploadError.message,
      );
    } else {
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
    }
    setUploading(false);
  };

  return (
    <div>
      <label className="text-sm font-medium text-charcoal mb-1.5 block" htmlFor={inputId}>
        {label}{optional ? ' (optional)' : ''}
      </label>
      <div className="flex items-center gap-3">
        {value && <img src={value} alt="Selected upload" className="h-12 w-12 rounded-lg object-cover border border-beige/40" />}
        <label htmlFor={inputId} className="btn-outline cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
          {uploading ? 'Uploading...' : value ? 'Replace image' : 'Choose image'}
        </label>
        {value && !uploading && (
          <button type="button" onClick={() => onChange('')} className="p-2 rounded-lg hover:bg-cream text-muted-text" aria-label={`Remove ${label.toLowerCase()}`}>
            <X className="w-4 h-4" />
          </button>
        )}
        <input id={inputId} type="file" accept="image/*" onChange={handleFileChange} className="sr-only" disabled={uploading} />
      </div>
      <p className="mt-1.5 text-xs text-muted-text">Choose a photo from this device. PNG, JPEG, WebP, and other image formats up to 10 MB.</p>
      {error && <p className="mt-1.5 text-xs text-red-500" role="alert">{error}</p>}
    </div>
  );
}

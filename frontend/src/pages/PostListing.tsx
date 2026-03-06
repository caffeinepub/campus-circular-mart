import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import AuthGuard from '../components/AuthGuard';
import { useCreateListing, useGetCallerUserProfile } from '../hooks/useQueries';
import { Category } from '../backend';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: Category.textbooks, label: 'Textbooks' },
  { value: Category.electronics, label: 'Electronics' },
  { value: Category.clothing, label: 'Clothing' },
  { value: Category.furniture, label: 'Furniture' },
  { value: Category.stationery, label: 'Stationery' },
  { value: Category.other, label: 'Other' },
];

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for base64 storage

interface FormErrors {
  title?: string;
  description?: string;
  price?: string;
  category?: string;
}

/**
 * Converts a File to a base64 data URL string for storage in the backend imageId field.
 * Resizes large images to keep the data URL within a reasonable size.
 */
async function fileToDataUrl(file: File, maxWidth = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };
    img.src = objectUrl;
  });
}

export default function PostListing() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutateAsync: createListing, isPending } = useCreateListing();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image must be under 5MB.');
      return;
    }

    setIsProcessingImage(true);
    try {
      // Show a quick preview from the raw file first
      const rawPreview = URL.createObjectURL(file);
      setImagePreview(rawPreview);

      // Convert to compressed data URL for storage
      const dataUrl = await fileToDataUrl(file);
      setImageDataUrl(dataUrl);
      // Replace preview with the processed version
      URL.revokeObjectURL(rawPreview);
      setImagePreview(dataUrl);
    } catch {
      toast.error('Failed to process image. Please try another file.');
      setImagePreview(null);
      setImageDataUrl(null);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required.';
    else if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters.';
    if (!description.trim()) newErrors.description = 'Description is required.';
    else if (description.trim().length < 10)
      newErrors.description = 'Description must be at least 10 characters.';
    const priceNum = parseFloat(price);
    if (!price) newErrors.price = 'Price is required.';
    else if (isNaN(priceNum) || priceNum < 0) newErrors.price = 'Please enter a valid price.';
    if (!category) newErrors.category = 'Please select a category.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // Simulate upload progress for UX feedback
      if (imageDataUrl) {
        setUploadProgress(30);
        await new Promise((r) => setTimeout(r, 100));
        setUploadProgress(70);
        await new Promise((r) => setTimeout(r, 100));
        setUploadProgress(100);
      }

      const sellerDisplayName = userProfile?.displayName || 'Anonymous';
      await createListing({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category as Category,
        imageId: imageDataUrl,
        sellerDisplayName,
      });

      toast.success('Listing posted successfully!');
      navigate({ to: '/' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to post listing. Please try again.');
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <AuthGuard requiredAuth={true} message="Please log in to post a listing on Campus Circular Mart.">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">Post a Listing</h1>
          <p className="text-muted-foreground">Fill in the details to list your item for sale.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo (optional)</Label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-muted">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                {isProcessingImage && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}
                {!isProcessingImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 hover:bg-accent/30 transition-colors flex flex-col items-center justify-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-accent transition-colors">
                  <ImagePlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Click to upload a photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
                <Progress value={uploadProgress} className="h-1.5" />
              </div>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Calculus Textbook 8th Edition"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((p) => ({ ...p, title: undefined }));
              }}
              maxLength={100}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the condition, any defects, why you're selling, etc."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: undefined }));
              }}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p className="text-sm text-destructive">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-muted-foreground">{description.length}/1000</p>
            </div>
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  $
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setErrors((p) => ({ ...p, price: undefined }));
                  }}
                  min="0"
                  step="0.01"
                  className="pl-7"
                />
              </div>
              {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v as Category);
                  setErrors((p) => ({ ...p, category: undefined }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: '/' })}
              className="flex-1"
              disabled={isPending || isProcessingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              disabled={isPending || isProcessingImage}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Posting…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Post Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}

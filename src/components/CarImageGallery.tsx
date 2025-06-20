import { useState, useEffect } from 'react';
import Image from 'next/image';
import sharp from 'sharp';
import { Skeleton } from '@/components/ui/skeleton';

interface CarImage {
  id: string;
  url: string;
  alt: string;
}

interface CarImageGalleryProps {
  images: CarImage[];
}

function CarImageGallery({ images }: CarImageGalleryProps) {
  const [optimizedImages, setOptimizedImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processImages = async () => {
      const processed = await Promise.all(
        images.map(async (img) => {
          try {
            const buffer = await sharp(img.url)
              .resize(800, 600)
              .webp({ quality: 80 })
              .toBuffer();
            return {
              ...img,
              optimizedUrl: `data:image/webp;base64,${buffer.toString('base64')}`
            };
          } catch (error) {
            console.error('Error processing image:', error);
            return img;
          }
        })
      );
      setOptimizedImages(processed);
      setLoading(false);
    };

    processImages();
  }, [images]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {images.map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {optimizedImages.map((img) => (
        <Image
          key={img.id}
          src={img.optimizedUrl || img.url}
          alt={img.alt}
          width={400}
          height={300}
          loading="lazy"
          className="rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
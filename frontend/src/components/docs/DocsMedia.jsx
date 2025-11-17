import React, { useState } from 'react';

/**
 * DocsImage - Lazy-loaded image component with caption
 *
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text (required for accessibility)
 * @param {string} props.caption - Optional image caption
 * @param {string} props.className - Additional CSS classes
 */
export const DocsImage = ({ src, alt, caption, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <figure className={`docs-image mb-6 ${className}`}>
      <div className="relative rounded-lg overflow-hidden border border-border bg-surface">
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          className={`w-full h-auto transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

/**
 * DocsVideo - Embedded video component with controls
 *
 * @param {Object} props
 * @param {string} props.src - Video source URL
 * @param {string} props.poster - Optional poster image URL
 * @param {string} props.caption - Optional video caption
 * @param {boolean} props.autoplay - Whether to autoplay (default: false)
 * @param {boolean} props.loop - Whether to loop (default: false)
 * @param {string} props.className - Additional CSS classes
 */
export const DocsVideo = ({ src, poster, caption, autoplay = false, loop = false, className = '' }) => {
  return (
    <figure className={`docs-video mb-6 ${className}`}>
      <div className="relative rounded-lg overflow-hidden border border-border bg-surface">
        <video
          src={src}
          poster={poster}
          controls
          autoPlay={autoplay}
          loop={loop}
          className="w-full h-auto"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

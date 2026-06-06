'use client'; // This tells Next.js this component uses browser features

import React, { useState } from 'react';
import { Play, Pause, Maximize2 } from 'lucide-react'; // Some nice icons

// We define what a 'Media' object looks like
interface Media {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'AUDIO';
  media_url: string;
}

export default function CinematicMediaEngine({ mediaList, title }: { mediaList: Media[], title: string }) {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!mediaList || mediaList.length === 0) return null;

  return (
    <div style={{
      position: 'relative', width: '100%', maxWidth: '800px', margin: '0 auto',
      backgroundColor: '#000', borderRadius: '16px', overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      
      {/* 1. The Media Display Area */}
      <div style={{ position: 'relative', height: '500px', display: 'flex', transition: 'transform 0.5s ease' }}>
        {mediaList.map((media, index) => (
          <div key={media.id} style={{
            minWidth: '100%', height: '100%', display: index === activeSlide ? 'block' : 'none'
          }}>
            {media.media_type === 'VIDEO' ? (
              <video
                src={media.media_url}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img
                src={media.media_url}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 2. The Title Overlay */}
      <div style={{
        position: 'absolute', bottom: '0', left: '0', right: '0',
        padding: '30px 20px 20px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
        color: 'white'
      }}>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{title}</h3>
      </div>

      {/* 3. Navigation Dots (Only show if there are multiple media items) */}
      {mediaList.length > 1 && (
        <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {mediaList.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              style={{
                width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                backgroundColor: index === activeSlide ? '#fff' : 'rgba(255,255,255,0.4)'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddMemoryForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // NEW: Description
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null); // NEW: File State
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a photo or video!");
      return;
    }
    setLoading(true);

    // To send files, we must use FormData, NOT JSON!
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('mediaFile', file); // Attach the actual file!
    
    // Format tags
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    formData.append('tags', JSON.stringify(tagArray));

    // Notice we do NOT ask for Lat/Lng anymore. The backend will extract it!

    const response = await fetch('http://localhost:5000/api/memories', {
      method: 'POST',
      body: formData, // Send the package
    });

    if (response.ok) {
      setTitle(''); setDescription(''); setTags(''); setFile(null);
      router.refresh(); 
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ 
      backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '12px', 
      border: '1px solid #333', maxWidth: '800px', margin: '0 auto 60px',
      display: 'flex', flexDirection: 'column', gap: '15px'
    }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>+ Log New Memory</h2>
      
      <input required placeholder="Memory Title" value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#000', color: 'white' }} />
      
      <textarea required placeholder="Description / Journal Entry" value={description} onChange={(e) => setDescription(e.target.value)}
        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#000', color: 'white', minHeight: '100px', resize: 'vertical' }} />

      <input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)}
        style={{ padding: '12px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#000', color: 'white' }} />

      <div style={{ padding: '12px', border: '1px dashed #4ade80', borderRadius: '6px', backgroundColor: '#000' }}>
        <label style={{ color: '#aaa', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Upload Photo or Video (Photo EXIF will auto-extract location!)</label>
        <input type="file" accept="image/*,video/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} style={{ color: 'white' }} />
      </div>

      <button type="submit" disabled={loading} style={{ 
        padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#4ade80', 
        color: '#000', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px'
      }}>
        {loading ? 'Processing Media & GPS Data...' : 'Save to Timeline'}
      </button>
    </form>
  );
}
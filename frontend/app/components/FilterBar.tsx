'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Keep the inputs in sync with the URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [tag, setTag] = useState(searchParams.get('tag') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    
    // This updates the URL, which tells Next.js to fetch new data!
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setTag('');
    router.push('/');
  };

  return (
    <form onSubmit={handleSearch} style={{ 
      backgroundColor: '#1a1a1a', padding: '20px', borderRadius: '12px', 
      border: '1px solid #333', maxWidth: '800px', margin: '0 auto 40px',
      display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'
    }}>
      <h3 style={{ margin: 0, color: '#aaa', fontSize: '16px', flexBasis: '100%' }}>🔍 Filter Timeline</h3>
      
      <input 
        placeholder="Search words..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#000', color: 'white', flex: 1 }} 
      />
      
      <input 
        placeholder="Search by tag (e.g. TCS)" 
        value={tag} 
        onChange={(e) => setTag(e.target.value)}
        style={{ padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#000', color: 'white', flex: 1 }} 
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
          Search
        </button>
        <button type="button" onClick={clearFilters} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #555', backgroundColor: 'transparent', color: '#aaa', cursor: 'pointer' }}>
          Clear
        </button>
      </div>
    </form>
  );
}
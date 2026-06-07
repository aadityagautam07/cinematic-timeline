import CinematicMediaEngine from './components/CinematicMediaEngine';
import MapWrapper from './components/MapWrapper'; // We import the new wrapper normally
import AddMemoryForm from './components/AddMemoryForm';
import FilterBar from './components/FilterBar';
import Link from 'next/link';

// Next.js passes searchParams to your server component automatically!
export default async function Home({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {

  // Construct the query string to send to the backend
  const search = searchParams.search || '';
  const tag = searchParams.tag || '';
  const queryString = new URLSearchParams({ search, tag }).toString();

  // Send it to the backend!
  const response = await fetch(`http://localhost:5000/api/memories?${queryString}`, { cache: 'no-store' });
  const result = await response.json();
  const memories = result.data || [];

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h1 style={{ color: 'white', fontSize: '36px', marginBottom: '10px' }}>Cinematic Geotagged Timeline</h1>
      <p style={{ color: '#888', marginBottom: '20px' }}>Your memories, mapped and beautifully rendered.</p>

      <Link href="/dashboard" style={{ display: 'inline-block', padding: '12px 24px', backgroundColor: '#4ade80', color: '#000', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
        View Analytics Dashboard →
      </Link>
    </header>

      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
      <h1 style={{ color: 'white', fontSize: '36px', marginBottom: '10px' }}>Cinematic Geotagged Timeline</h1>
      <p style={{ color: '#888' }}>Your memories, mapped and beautifully rendered.</p>
    </header>

    {/* The New Search Panel! */}
    <FilterBar />

    {/* Our New Form goes right here! */}
    <AddMemoryForm />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '800px', margin: '0 auto' }}>
        {memories.map((memory: any) => {
          
          // Now we use the REAL media URL from your local uploads folder!
          const mediaArray = memory.media_url ? [
            { id: memory.id + '-media', media_type: memory.media_type, media_url: memory.media_url }
          ] : [];

          return (
            <div key={memory.id}>
              {/* The Cinematic Video Player */}
              <CinematicMediaEngine mediaList={mediaArray} title={memory.title} />
              
              {/* NEW: Description Box */}
              {memory.description && (
                <p style={{ marginTop: '15px', color: '#eee', fontSize: '16px', lineHeight: '1.6' }}>
                  {memory.description}
                </p>
              )}
              
              {/* Info Bar */}
              <div style={{ margin: '15px 0', color: '#aaa', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>📅 {new Date(memory.memory_date).toLocaleDateString()}</span>
                <span>📍 {memory.lat ? 'Geotagged Location' : 'Earth'}</span>
              </div>

              {/* Display Tags */}
              {memory.tags && memory.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  {memory.tags.map((tag: string, index: number) => (
                    <span key={index} style={{ 
                      backgroundColor: '#222', color: '#4ade80', padding: '4px 12px', 
                      borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #333'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* The Safely Wrapped Interactive Map */}
              {memory.lat && memory.lng && (
                <MapWrapper lat={memory.lat} lng={memory.lng} title={memory.title} />
              )}
              
            </div>
          );
        })}
      </div>

    </div>
  );
}
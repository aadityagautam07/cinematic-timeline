import CinematicMediaEngine from './components/CinematicMediaEngine';
import MapWrapper from './components/MapWrapper'; // We import the new wrapper normally

export default async function Home() {
  const response = await fetch('http://localhost:5000/api/memories', { cache: 'no-store' });
  const result = await response.json();
  const memories = result.data;

  return (
    <div style={{ backgroundColor: '#111', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: 'white', fontSize: '36px', marginBottom: '10px' }}>Cinematic Geotagged Timeline</h1>
        <p style={{ color: '#888' }}>Your memories, mapped and beautifully rendered.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', maxWidth: '800px', margin: '0 auto' }}>
        {memories.map((memory: any) => {
          
          const mediaArray = [
            { id: memory.id + '-media', media_type: 'VIDEO', media_url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
          ];

          return (
            <div key={memory.id}>
              {/* The Cinematic Video Player */}
              <CinematicMediaEngine 
                mediaList={mediaArray} 
                title={memory.title} 
              />
              
              {/* Info Bar */}
              <div style={{ margin: '15px 0', color: '#aaa', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>📅 {new Date(memory.memory_date).toLocaleDateString()}</span>
                <span>📍 {memory.lat ? 'Geotagged Location' : 'Earth'}</span>
              </div>

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
import Link from 'next/link';

export default async function Dashboard() {
  // Fetch the stats from our new backend route!
  const response = await fetch('http://localhost:5000/api/recap', { cache: 'no-store' });
  const result = await response.json();
  
  const { totalMemories = 0, topTags = [], monthlyData = [] } = result;

  // Find the highest month to scale our CSS bar chart properly
  const maxMonthCount = Math.max(...monthlyData.map((m: any) => parseInt(m.count)), 1);

  return (
    <div style={{ backgroundColor: '#111', color: 'white', minHeight: '100vh', padding: '50px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '36px' }}>📊 Monthly Recap</h1>
          <Link href="/" style={{ padding: '10px 20px', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
            ← Back to Timeline
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          {/* Total Memories Card */}
          <div style={{ flex: 1, backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', border: '1px solid #333', textAlign: 'center' }}>
            <h3 style={{ margin: 0, color: '#aaa', fontSize: '18px' }}>Total Memories</h3>
            <p style={{ margin: '10px 0 0', fontSize: '48px', fontWeight: 'bold', color: '#4ade80' }}>{totalMemories}</p>
          </div>

          {/* Top Tags Card */}
          <div style={{ flex: 2, backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#aaa', fontSize: '18px' }}>Most Active Tags</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {topTags.map((tag: any, idx: number) => (
                <span key={idx} style={{ backgroundColor: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                  #{tag.name} ({tag.count})
                </span>
              ))}
              {topTags.length === 0 && <span style={{ color: '#555' }}>No tags yet.</span>}
            </div>
          </div>
        </div>

        {/* CSS Bar Chart */}
        <div style={{ backgroundColor: '#1a1a1a', padding: '30px', borderRadius: '16px', border: '1px solid #333' }}>
          <h3 style={{ margin: '0 0 30px 0', color: '#aaa', fontSize: '18px' }}>Activity by Month</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '250px', paddingTop: '20px', borderBottom: '2px solid #333' }}>
            {monthlyData.map((data: any, idx: number) => {
              const heightPercentage = (parseInt(data.count) / maxMonthCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                  <span style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '10px' }}>{data.count}</span>
                  <div style={{ width: '100%', height: `${heightPercentage}%`, backgroundColor: '#4ade80', borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }}></div>
                  <span style={{ marginTop: '15px', color: '#888', fontSize: '14px' }}>{data.month}</span>
                </div>
              );
            })}
            {monthlyData.length === 0 && <div style={{ width: '100%', textAlign: 'center', color: '#555', alignSelf: 'center' }}>Not enough data for chart yet.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
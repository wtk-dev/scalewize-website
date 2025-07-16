export default function DebugPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Debug Page</h1>
      <p>If you can see this, basic routing is working!</p>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  )
} 
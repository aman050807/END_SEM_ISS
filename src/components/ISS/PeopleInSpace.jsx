import React from 'react';

export default function PeopleInSpace({ people }) {
  const { number = 0, people: crew = [] } = people;
  const initials = name => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#63b3ed','#7c3aed','#10b981','#ed8936','#f56565','#48bb78','#9f7aea'];

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <div className="stat-value" style={{ fontSize:'2.2rem' }}>{number}</div>
        <div>
          <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text)' }}>People in Space</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text2)' }}>Currently aboard the ISS &amp; other spacecraft</div>
        </div>
      </div>
      {crew.length > 0 ? (
        <div className="astronaut-list">
          {crew.map((p, i) => (
            <div className="astronaut-item" key={p.name}>
              <div className="astronaut-avatar" style={{ background: `linear-gradient(135deg, ${colors[i % colors.length]}, ${colors[(i+2) % colors.length]})` }}>
                {initials(p.name)}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:500, fontSize:'0.88rem', color:'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text3)' }}>{p.craft || 'ISS'}</div>
              </div>
              <span className="badge badge-blue">{p.craft || 'ISS'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color:'var(--text3)', fontSize:'0.85rem', textAlign:'center', padding:'20px 0' }}>
          Loading crew data…
        </div>
      )}
    </div>
  );
}

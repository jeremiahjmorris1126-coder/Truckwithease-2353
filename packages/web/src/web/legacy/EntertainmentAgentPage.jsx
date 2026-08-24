import { useState } from 'react';

const NAVY = '#0B2A6B';
const ORANGE = '#FF6B00';
const AMBER = '#FFB400';
const GREEN = '#16A34A';
const RED = '#DC2626';
const DARK = '#06090F';

export default function EntertainmentAgentPage() {
  const [selectedTab, setSelectedTab] = useState('discover');
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [movies] = useState([
    {
      id: 1,
      title: 'The Road Ahead',
      genre: 'Drama',
      year: 2023,
      rating: 8.4,
      duration: '2h 28m',
      description: 'A trucker\'s journey across America, facing personal demons and the open road.',
      cover: '🎬',
      director: 'James Chen',
      cast: ['Tom Hardy', 'Nicole Kidman'],
    },
    {
      id: 2,
      title: 'Convoy',
      genre: 'Action',
      year: 1978,
      rating: 7.1,
      duration: '1h 50m',
      description: 'A group of truckers band together against an oppressive sheriff.',
      cover: '🚛',
      director: 'Sam Peckinpah',
      cast: ['Kris Kristofferson', 'Ali MacGraw'],
    },
    {
      id: 3,
      title: 'Midnight Run',
      genre: 'Comedy/Thriller',
      year: 1988,
      rating: 8.0,
      duration: '2h 6m',
      description: 'A bounty hunter transports a fugitive across America by road.',
      cover: '🏃',
      director: 'Martin Brest',
      cast: ['Robert De Niro', 'Charles Grodin'],
    },
    {
      id: 4,
      title: 'Duel',
      genre: 'Thriller',
      year: 1971,
      rating: 8.3,
      duration: '1h 29m',
      description: 'A man is pursued by a mysterious truck driver on the highway.',
      cover: '🚙',
      director: 'Steven Spielberg',
      cast: ['Dennis Weaver'],
    },
    {
      id: 5,
      title: 'Two-Lane Blacktop',
      genre: 'Drama',
      year: 1971,
      rating: 7.4,
      duration: '1h 43m',
      description: 'Two car drivers race across America in a high-speed journey.',
      cover: '🏎️',
      director: 'Monte Hellman',
      cast: ['James Taylor', 'Warren Oates'],
    },
    {
      id: 6,
      title: 'Christine',
      genre: 'Horror/Thriller',
      year: 1983,
      rating: 7.1,
      duration: '1h 51m',
      description: 'A possessed car becomes obsessed with its owner.',
      cover: '🚗',
      director: 'John Carpenter',
      cast: ['Kyle MacLachlan', 'Keith Gordon'],
    },
  ]);

  const [songs] = useState([
    {
      id: 1,
      title: 'Radar Love',
      artist: 'Golden Earring',
      genre: 'Classic Rock',
      duration: '3:36',
      year: 1973,
      energy: 'High',
      mood: 'Energetic',
      description: 'The ultimate road trip anthem with an iconic guitar riff.',
    },
    {
      id: 2,
      title: 'Highway to Hell',
      artist: 'AC/DC',
      genre: 'Rock',
      duration: '3:28',
      year: 1979,
      energy: 'High',
      mood: 'Intense',
      description: 'Pure rock energy perfect for long drives.',
    },
    {
      id: 3,
      title: 'Born to Be Wild',
      artist: 'Steppenwolf',
      genre: 'Rock',
      duration: '3:20',
      year: 1968,
      energy: 'High',
      mood: 'Rebellious',
      description: 'The ultimate freedom and open road song.',
    },
    {
      id: 4,
      title: 'Take Me Home, Country Roads',
      artist: 'John Denver',
      genre: 'Country',
      duration: '3:29',
      year: 1971,
      energy: 'Medium',
      mood: 'Peaceful',
      description: 'A soothing journey through American highways.',
    },
    {
      id: 5,
      title: 'Life in the Fast Lane',
      artist: 'Eagles',
      genre: 'Rock',
      duration: '4:47',
      year: 1976,
      energy: 'High',
      mood: 'Adrenaline',
      description: 'Smooth rock with driving beats.',
    },
    {
      id: 6,
      title: 'On the Road Again',
      artist: 'Willie Nelson',
      genre: 'Country',
      duration: '3:11',
      year: 1980,
      energy: 'Medium',
      mood: 'Adventurous',
      description: 'The trucker\'s anthem.',
    },
    {
      id: 7,
      title: 'Black Dog',
      artist: 'Led Zeppelin',
      genre: 'Rock',
      duration: '4:54',
      year: 1971,
      energy: 'High',
      mood: 'Powerful',
      description: 'Heavy rock for those long night drives.',
    },
    {
      id: 8,
      title: 'Come and Go',
      artist: 'Juice WRLD',
      genre: 'Hip-Hop',
      duration: '2:20',
      year: 2019,
      energy: 'Medium',
      mood: 'Chill',
      description: 'Modern hip-hop for daytime cruising.',
    },
  ]);

  const [recommendations] = useState({
    lateNight: [
      { type: 'movie', title: 'Duel', reason: 'Intense thriller to keep you alert' },
      { type: 'song', title: 'Black Dog', reason: 'Heavy, driving beat for focus' },
    ],
    relaxing: [
      { type: 'movie', title: 'Two-Lane Blacktop', reason: 'Meditative road journey' },
      { type: 'song', title: 'Take Me Home, Country Roads', reason: 'Calming and peaceful' },
    ],
    energetic: [
      { type: 'movie', title: 'Convoy', reason: 'Action-packed excitement' },
      { type: 'song', title: 'Born to Be Wild', reason: 'Maximum energy boost' },
    ],
  });

  const filteredMovies = movies.filter((m) => {
    const matchGenre = selectedGenre === 'All' || m.genre.includes(selectedGenre);
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  const filteredSongs = songs.filter((s) => {
    const matchGenre = selectedGenre === 'All' || s.genre.includes(selectedGenre);
    const matchSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchSearch;
  });

  const playMovie = (movie) => {
    setCurrentlyPlaying({ type: 'movie', ...movie });
  };

  const playSong = (song) => {
    setCurrentlyPlaying({ type: 'song', ...song });
  };

  return (
    <div style={{ fontFamily: "'Poppins',sans-serif", background: '#F8FAFC', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .ent-tab {
          background: none;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          color: #64748B;
          font-family: 'Poppins',sans-serif;
        }
        .ent-tab.active {
          color: ${NAVY};
          border-bottom-color: ${AMBER};
        }
        .ent-btn {
          background: ${AMBER};
          color: ${DARK};
          border: none;
          borderRadius: 8px;
          padding: 10px 16px;
          fontSize: 13px;
          fontWeight: 700;
          cursor: pointer;
          fontFamily: 'Poppins',sans-serif;
          transition: opacity 0.2s;
        }
        .ent-btn:hover { opacity: 0.88; }
        .ent-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ent-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* Header */}
      <div style={{ background: NAVY, color: 'white', padding: '28px 5%', borderBottom: `2px solid ${ORANGE}` }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 32 }}>🎬</span>
            <h1 style={{ fontSize: 32, fontWeight: 900 }}>Entertainment Agent</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            Movies and music recommendations. Play on request. Tailored to your mood and drive time. Keep the road entertaining.
          </p>
        </div>
      </div>

      {/* Now Playing */}
      {currentlyPlaying && (
        <div style={{ background: ORANGE, color: DARK, padding: '20px 5%' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, opacity: 0.8 }}>NOW PLAYING</div>
              <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>
                {currentlyPlaying.type === 'movie' ? '▶️' : '🎵'} {currentlyPlaying.title}
              </h2>
              <p style={{ fontSize: 12, opacity: 0.9 }}>
                {currentlyPlaying.type === 'movie'
                  ? `${currentlyPlaying.director} • ${currentlyPlaying.duration}`
                  : `${currentlyPlaying.artist} • ${currentlyPlaying.duration}`}
              </p>
            </div>
            <button
              onClick={() => setCurrentlyPlaying(null)}
              style={{
                background: 'rgba(0,0,0,0.2)',
                color: DARK,
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'Poppins',sans-serif",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ borderBottom: '1px solid #E2E8F0', background: 'white', padding: '0 5%', display: 'flex', gap: 0 }}>
        {[
          { id: 'discover', label: '🎯 Discover & Play' },
          { id: 'recommendations', label: '💡 Smart Recommendations' },
          { id: 'movies', label: '🎬 All Movies' },
          { id: 'music', label: '🎵 All Music' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`ent-tab ${selectedTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ padding: '32px 5%', maxWidth: 1400, margin: '0 auto' }}>
        {/* ─── DISCOVER TAB ─── */}
        {selectedTab === 'discover' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, color: NAVY }}>Quick Play</h2>
            <p style={{ color: '#64748B', marginBottom: 28, fontSize: 14 }}>
              Search or browse by genre. Click any title to play instantly.
            </p>

            {/* Search & Filter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 32 }}>
              <input
                type="text"
                placeholder="Search movies, songs, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: 14,
                }}
              />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E2E8F0',
                  borderRadius: 10,
                  fontFamily: "'Poppins',sans-serif",
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                <option value="All">All Genres</option>
                <option value="Drama">Drama</option>
                <option value="Action">Action</option>
                <option value="Thriller">Thriller</option>
                <option value="Rock">Rock</option>
                <option value="Country">Country</option>
                <option value="Hip-Hop">Hip-Hop</option>
              </select>
            </div>

            {/* Movies Section */}
            <div style={{ marginBottom: 40 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 16 }}>📽️ Movies</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredMovies.length > 0 ? (
                  filteredMovies.map((movie) => (
                    <div
                      key={movie.id}
                      className="ent-card"
                      style={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 48, marginBottom: 12, textAlign: 'center' }}>{movie.cover}</div>
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{movie.title}</h4>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>
                        {movie.genre} • {movie.year}
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>{movie.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: ORANGE, fontWeight: 700 }}>⭐ {movie.rating}/10</span>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{movie.duration}</span>
                      </div>
                      <button onClick={() => playMovie(movie)} className="ent-btn" style={{ width: '100%' }}>
                        ▶ Play Movie
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', gridColumn: '1 / -1' }}>No movies found.</p>
                )}
              </div>
            </div>

            {/* Music Section */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 16 }}>🎵 Music</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {filteredSongs.length > 0 ? (
                  filteredSongs.map((song) => (
                    <div
                      key={song.id}
                      className="ent-card"
                      style={{
                        background: 'white',
                        border: '1px solid #E2E8F0',
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <h4 style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{song.title}</h4>
                      <div style={{ fontSize: 13, color: ORANGE, fontWeight: 700, marginBottom: 8 }}>{song.artist}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                        {song.genre} • {song.year}
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <span style={{ background: '#F8FAFC', color: '#64748B', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {song.mood}
                        </span>
                        <span style={{ background: '#F8FAFC', color: '#64748B', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                          {song.energy}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 12, lineHeight: 1.5 }}>{song.description}</p>
                      <button onClick={() => playSong(song)} className="ent-btn" style={{ width: '100%' }}>
                        ▶ Play Song
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#94A3B8', gridColumn: '1 / -1' }}>No songs found.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── RECOMMENDATIONS TAB ─── */}
        {selectedTab === 'recommendations' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>Smart Recommendations</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {[
                { title: 'Late Night Driving', icon: '🌙', key: 'lateNight' },
                { title: 'Relaxing Journey', icon: '😌', key: 'relaxing' },
                { title: 'High Energy', icon: '⚡', key: 'energetic' },
              ].map((category) => (
                <div
                  key={category.key}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 32 }}>{category.icon}</span>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{category.title}</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
                    {recommendations[category.key].map((rec, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#F8FAFC',
                          borderRadius: 8,
                          padding: 12,
                          borderLeft: `4px solid ${AMBER}`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
                              {rec.type === 'movie' ? '🎬' : '🎵'} {rec.title}
                            </div>
                            <p style={{ fontSize: 12, color: '#64748B' }}>{rec.reason}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (rec.type === 'movie') {
                              const m = movies.find((x) => x.title === rec.title);
                              if (m) playMovie(m);
                            } else {
                              const s = songs.find((x) => x.title === rec.title);
                              if (s) playSong(s);
                            }
                          }}
                          className="ent-btn"
                          style={{ width: '100%', marginTop: 8, fontSize: 12, padding: '6px 10px' }}
                        >
                          Play
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ALL MOVIES TAB ─── */}
        {selectedTab === 'movies' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>All Movies</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="ent-card"
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 12,
                    padding: 20,
                  }}
                >
                  <div style={{ fontSize: 56, marginBottom: 12, textAlign: 'center' }}>{movie.cover}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{movie.title}</h3>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                    {movie.genre} • {movie.year} • ⭐ {movie.rating}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748B', marginBottom: 14, lineHeight: 1.6 }}>{movie.description}</p>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 12 }}>
                    Directed by {movie.director} • {movie.duration}
                  </div>
                  <button onClick={() => playMovie(movie)} className="ent-btn" style={{ width: '100%' }}>
                    ▶ Play Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ALL MUSIC TAB ─── */}
        {selectedTab === 'music' && (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 28, color: NAVY }}>All Music</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {songs.map((song) => (
                <div
                  key={song.id}
                  style={{
                    background: 'white',
                    border: '1px solid #E2E8F0',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{song.title}</h3>
                    <div style={{ fontSize: 12, color: ORANGE, fontWeight: 700, marginBottom: 6 }}>{song.artist}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      {song.genre} • {song.year} • {song.duration}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: '#F8FAFC', color: '#64748B', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                      {song.mood}
                    </span>
                    <button onClick={() => playSong(song)} className="ent-btn">
                      ▶ Play
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

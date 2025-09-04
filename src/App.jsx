
import { useState, useEffect } from "react";
import "./App.css";
import AuthModal from "./AuthModal";

function App() {
  const [games, setGames] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Reviews states
  const [reviews, setReviews] = useState({});
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0); 

  // Load user from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  // Load reviews from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("reviews");
    if (raw) setReviews(JSON.parse(raw));
  }, []);

  // Save reviews to localStorage
  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Fetch games from RAWG API
  const fetchGames = async (page) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games?key=${
          import.meta.env.VITE_RAWG_API_KEY
        }&page=${page}&page_size=24`
      );
      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setHasMore(false);
      } else {
        setGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const uniqueNew = data.results.filter((g) => !existingIds.has(g.id));
          return [...prev, ...uniqueNew];
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames(page);
  }, [page]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100 &&
        !loading &&
        hasMore
      ) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (selectedGame) {
    return (
      <>
        <header className="appHeader">
          <h1 className="games-title">Games</h1>
          <div className="authActions">
            {user ? (
              <>
                <span className="userHello">
                  Hi, {user.username || user.email}
                </span>
                <button className="btn btn--secondary" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn" onClick={() => setAuthOpen(true)}>
                Registration / Login
              </button>
            )}
          </div>
        </header>

        <AuthModal
          open={authOpen}
          onClose={() => setAuthOpen(false)}
          onAuthSuccess={(u) => setUser(u)}
        />

        <div
          className="game-detail"
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <button onClick={() => setSelectedGame(null)} className="back-button">
            ⬅ Back
          </button>

          <h2>{selectedGame.name}</h2>
          <img
            src={selectedGame.background_image}
            alt={selectedGame.name}
            className="detail-image"
          />
          <p><strong>Released:</strong> {selectedGame.released}</p>
          <p><strong>Rating:</strong> {selectedGame.rating} / 5</p>
          <p><strong>Metacritic:</strong> {selectedGame.metacritic || "N/A"}</p>
          <p><strong>Genres:</strong> {selectedGame.genres.map((g) => g.name).join(", ")}</p>
          <p><strong>Platforms:</strong> {selectedGame.platforms.map((p) => p.platform.name).join(", ")}</p>

          {/* Review Form */}
          {user && (
            <div style={{ marginTop: "30px", width: "100%", maxWidth: "600px" }}>
              <h3>Write a review</h3>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows="4"
                style={{ width: "100%", padding: "10px", borderRadius: "6px" }}
                placeholder="Share your thoughts about this game..."
              />
              {/* Star rating */}
              <div style={{ marginTop: "10px" }}>
                <span>Rating: </span>
                {[1,2,3,4,5].map((star) => (
                  <span
                    key={star}
                    style={{
                      cursor: "pointer",
                      color: star <= reviewRating ? "gold" : "#555",
                      fontSize: "1.5rem",
                      marginRight: "5px",
                    }}
                    onClick={() => setReviewRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                style={{ marginTop: "10px", padding: "10px 20px", cursor: "pointer" }}
                onClick={() => {
                  if (!reviewText.trim()) return;

                  setReviews((prev) => ({
                    ...prev,
                    [selectedGame.id]: [
                      ...(prev[selectedGame.id] || []),
                      {
                        user: user.username || user.email,
                        text: reviewText,
                        rating: reviewRating,
                      },
                    ],
                  }));

                  setReviewText("");
                  setReviewRating(0);
                }}
              >
                Submit Review
              </button>
            </div>
          )}

          {/* Display Reviews */}
          <div style={{ marginTop: "20px", width: "100%", maxWidth: "600px" }}>
            <h3>Reviews</h3>
            {(reviews[selectedGame.id] || []).length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews[selectedGame.id].map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "10px",
                    background: "#333",
                    padding: "10px",
                    borderRadius: "6px",
                    color: "#fff",
                  }}
                >
                  <strong>{r.user}</strong> - {r.rating} / 5 ★
                  <p style={{ margin: 0 }}>{r.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  }

 
  return (
    <div>
      <header className="appHeader">
        <h1 className="games-title">Games</h1>
        <div className="authActions">
          {user ? (
            <>
              <span className="userHello">Hi, {user.username || user.email}</span>
              <button className="btn btn--secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => setAuthOpen(true)}>
              Registration / Login
            </button>
          )}
        </div>
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      {/* Search input */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search for a game..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div className="games-grid">
        {filteredGames.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => setSelectedGame(game)}
          >
            <img src={game.background_image} alt={game.name} />
            <h3>{game.name}</h3>
          </div>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading more games...</p>}
      {!hasMore && <p style={{ textAlign: "center" }}>No more games to load.</p>}
    </div>
  );
}

export default App;
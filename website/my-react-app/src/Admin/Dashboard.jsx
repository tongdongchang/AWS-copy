import { useState, useEffect } from "react";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

function Dashboard() {
  const [stats, setStats] = useState({
    total_tracks: 0,
    total_mvs: 0,
    total_artists: 0,
    total_albums: 0,
    total_users: 0,
    total_playlists: 0,
  });
  const [error, setError] = useState({ type: null, mess: null, timestamp: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AnxiosInstance.get("admin/dashboard/")
      .then((res) => { setStats(res.data); setLoading(false); })
      .catch(() => {
        setError({ type: "error", mess: "Không thể tải dữ liệu thống kê", timestamp: Date.now() });
        setLoading(false);
      });
  }, []);

  const cards = [
    { title: "Bài hát",    count: stats.total_tracks,    icon: "fa-music",        color: "#4CAF50" },
    { title: "MV",         count: stats.total_mvs,        icon: "fa-video",        color: "#2196F3" },
    { title: "Nghệ sĩ",   count: stats.total_artists,    icon: "fa-user",         color: "#FF9800" },
    { title: "Album",      count: stats.total_albums,     icon: "fa-record-vinyl", color: "#9C27B0" },
    { title: "Người dùng", count: stats.total_users,      icon: "fa-users",        color: "#F44336" },
    { title: "Playlist",   count: stats.total_playlists,  icon: "fa-list",         color: "#607D8B" },
  ];

  return (
    <div
      className="analytics-dashboard"
      style={{
        background: "linear-gradient(#a9a9f6, #bda5bd)",
        minHeight: "100vh",
        paddingTop: "50px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
    >
      <Alert error={error.mess} type={error.type} id={error.timestamp} />

      {loading ? (
        <div className="text-center mt-5">Đang tải dữ liệu...</div>
      ) : (
        <>
          <h1 className="mb-4">Dashboard Analytics</h1>
          <div className="row g-4">
            {cards.map((card, index) => (
              <div className="col-xl-4 col-lg-6 col-md-6 col-sm-12" key={index}>
                <div className="card shadow-sm border-0 rounded-3">
                  <div className="card-body d-flex align-items-center">
                    <div
                      className="icon-wrapper d-flex align-items-center justify-content-center rounded-circle"
                      style={{ backgroundColor: card.color, width: 60, height: 60, marginRight: 20, flexShrink: 0 }}
                    >
                      <i className={`fa-solid ${card.icon} fa-2x text-white`}></i>
                    </div>
                    <div>
                      <h5 className="card-title text-muted mb-1">{card.title}</h5>
                      <h2 className="card-text fw-bold">{card.count.toLocaleString()}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;

import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

function ViewDetail() {
  const location = useLocation();
  const albumId = location.state?.albumId;
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]); // để chọn album khi thêm track (có thể disable)
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [error, setError] = useState({ type: null, mess: null });
  const [isPrenium, setIsPrenium] = useState(false);

  // Refs cho form modal (theo cấu trúc Track.jsx)
  const nameRef = useRef();
  const artistRef = useRef();
  const albumRef = useRef();
  const categoryRef = useRef();
  const fileImgRef = useRef();
  const fileRef = useRef();

  // Fetch album và tracks
  useEffect(() => {
    if (!albumId) return;
    AnxiosInstance.get("trackalbum/", { params: { id: albumId } })
      .then((res) => {
        // Giả sử API trả về { id, title, ..., track_set: [...] }
        setAlbum(res.data);
        setTracks(res.data.track_set || []);
      })
      .catch((err) => console.log(err));

    // Lấy danh sách artists, albums để select
    AnxiosInstance.get("artist/").then((res) => setArtists(res.data));
    AnxiosInstance.get("album/?fields=id,title").then((res) => setAlbums(res.data));
  }, [albumId]);

  // Tìm kiếm track trong album (lọc client-side)
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xử lý thêm track mới
  const handleAddTrack = () => {
    const formData = new FormData();
    formData.append("title", nameRef.current.value);
    formData.append("category", categoryRef.current.value);
    formData.append("album", albumId); // gán thẳng album hiện tại
    formData.append("artists", artistRef.current.value);
    formData.append("is_Prenium", isPrenium);
    if (fileRef.current.files[0]) formData.append("file", fileRef.current.files[0]);
    if (fileImgRef.current.files[0]) formData.append("fileImg", fileImgRef.current.files[0]);

    AnxiosInstance.post("TrackChanging/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        setError({ type: "message", mess: "Thêm track thành công", timestamp: Date.now() });
        // Refresh tracks
        AnxiosInstance.get("trackalbum/", { params: { id: albumId } })
          .then((res) => setTracks(res.data.track_set || []));
      })
      .catch((err) => console.log(err));
  };

  // Xử lý cập nhật track
  const handleUpdateTrack = () => {
    const formData = new FormData();
    formData.append("title", nameRef.current.value);
    formData.append("category", categoryRef.current.value);
    formData.append("album", albumRef.current.value); // cho phép đổi album nếu cần
    formData.append("artists", artistRef.current.value);
    formData.append("is_Prenium", isPrenium ? "true" : "false");
    if (fileRef.current.files[0]) formData.append("file", fileRef.current.files[0]);
    if (fileImgRef.current.files[0]) formData.append("fileImg", fileImgRef.current.files[0]);

    AnxiosInstance.put(`TrackChanging/${currentTrackId}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        setError({ type: "message", mess: "Cập nhật track thành công", timestamp: Date.now() });
        AnxiosInstance.get("trackalbum/", { params: { id: albumId } })
          .then((res) => setTracks(res.data.track_set || []));
      })
      .catch((err) => console.log(err));
  };

  // Xoá track
  const handleDeleteTrack = (trackId) => {
    if (!window.confirm("Xoá track này?")) return;
    AnxiosInstance.delete(`TrackChanging/${trackId}/`)
      .then(() => {
        setError({ type: "message", mess: "Đã xoá track", timestamp: Date.now() });
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
      })
      .catch((err) => console.log(err));
  };

  // Pre-fill form khi edit
  useEffect(() => {
    if (mode === "edit" && currentTrackId) {
      const track = tracks.find((t) => t.id === currentTrackId);
      if (track && nameRef.current) {
        nameRef.current.value = track.title || "";
        categoryRef.current.value = track.category || "audio";
        artistRef.current.value = track.artists || "";
        albumRef.current.value = track.album || albumId;
        setIsPrenium(track.is_Prenium);
        // file input không set được
      }
    } else if (mode === "add") {
      if (nameRef.current) nameRef.current.value = "";
      if (categoryRef.current) categoryRef.current.value = "audio";
      if (artistRef.current) artistRef.current.value = "";
      if (albumRef.current) albumRef.current.value = albumId;
      setIsPrenium(false);
    }
  }, [mode, currentTrackId, tracks, albumId]);

  if (!albumId) {
    return <div>Không tìm thấy album ID. Vui lòng quay lại.</div>;
  }

  return (
    <div className="ManageUsers Track ViewDetail">
      <Alert error={error.mess} type={error.type} id={error.timestamp} />
      <h1>Detail : {album?.title}</h1>

      {/* Search + Add button */}
      <div>
        <label htmlFor="searchTrack" className="form-label">Search:</label>
        <div className="d-flex">
          <div>
            <input
              className="form-control"
              type="search"
              id="searchTrack"
              placeholder="Name of track"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#trackModal"
            onClick={() => { setMode("add"); setCurrentTrackId(null); }}
          >
            Add New Track
          </button>
        </div>
      </div>

      {/* Modal thêm / sửa track (copy từ Track.jsx, điều chỉnh một chút) */}
      <div className="modal" id="trackModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{mode === "add" ? "Add New" : "Edit"} Track</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form className="formADD">
                <div>
                  <label className="form-label">Name:</label>
                  <input type="text" ref={nameRef} className="form-control" placeholder="Enter name" />
                </div>
                <div>
                  <label className="form-label">Select Artist</label>
                  <select ref={artistRef} className="form-select">
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Select Album</label>
                  <select ref={albumRef} className="form-select" disabled={mode === "add"} /* khi thêm luôn gán album hiện tại */>
                    {albums.map((a) => (
                      <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Select Category</label>
                  <select ref={categoryRef} className="form-select">
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Is Premium?</label>
                  <div className="form-checking">
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="optradio"
                        value="true"
                        checked={isPrenium === true}
                        onChange={() => setIsPrenium(true)}
                      />
                      <label className="form-check-label">Premium</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="optradio"
                        value="false"
                        checked={isPrenium === false}
                        onChange={() => setIsPrenium(false)}
                      />
                      <label className="form-check-label">Free</label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="form-label">File image</label><br />
                  <input type="file" ref={fileImgRef} accept="image/*" />
                </div>
                <div>
                  <label className="form-label">File</label><br />
                  <input type="file" ref={fileRef} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              {mode === "add" && (
                <button className="btn btn-info" data-bs-dismiss="modal" onClick={handleAddTrack}>Add</button>
              )}
              {mode === "edit" && (
                <button className="btn btn-info" data-bs-dismiss="modal" onClick={handleUpdateTrack}>Update</button>
              )}
              <button className="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách track */}
      <div className="scroll-table">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Release date</th>
              <th>URL</th>
              <th colSpan="2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map((track) => (
              <tr key={track.id}>
                <td>{track.title}</td>
                <td>{track.release_date}</td>
                <td>
                  <a href={track.file} style={{color:"black"}} target="_blank" rel="noreferrer">{track.file}</a>
                </td>
                <td
                  data-bs-toggle="modal"
                  data-bs-target="#trackModal"
                  onClick={() => { setMode("edit"); setCurrentTrackId(track.id); }}
                >
                  Edit
                </td>
                <td onClick={() => handleDeleteTrack(track.id)}>Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ViewDetail;
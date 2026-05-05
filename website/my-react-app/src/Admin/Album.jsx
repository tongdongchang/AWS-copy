import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

function Album() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState({ type: null, mess: null });

  // Refs cho form modal
  const titleRef = useRef();
  const artistRef = useRef();
  const descRef = useRef();
  const imageRef = useRef();

  // Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchAlbums();
    AnxiosInstance.get("artist/")
      .then((res) => setArtists(res.data))
      .catch((err) => console.log(err));
  }, []);

  const fetchAlbums = () => {
    AnxiosInstance.get("album/") // tự động trả về đầy đủ fields
      .then((res) => setAlbums(res.data))
      .catch((err) => console.log(err));
  };

  // Tìm kiếm album
  const handleSearch = (e) => {
    const title = e.target.value.trim();
    if (title) {
      AnxiosInstance.get("searchFull/", {
        params: { category: "album", title: title },
      })
        .then((res) => setAlbums(res.data))
        .catch((err) => console.log(err));
    } else {
      fetchAlbums(); // trả về danh sách gốc khi xoá input
    }
  };

  // Map artist id -> name để hiển thị
  const getArtistName = (artistsId) => {
    const artist = artists.find((a) => a.id === artistsId);
    return artist ? artist.name : "Unknown";
  };

  // Thêm album
  const handleAdd = () => {
    const formData = new FormData();
    formData.append("title", titleRef.current.value.trim());
    formData.append("artists", artistRef.current.value);
    formData.append("decription", descRef.current.value.trim());
    if (imageRef.current.files[0]) {
      formData.append("image_file", imageRef.current.files[0]);
    }

    AnxiosInstance.post("album/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        setError({ type: "message", mess: "Thêm album thành công", timestamp: Date.now() });
        fetchAlbums();
      })
      .catch((err) => console.log(err));
  };

  // Cập nhật album
  const handleUpdate = () => {
    const formData = new FormData();
    formData.append("title", titleRef.current.value.trim());
    formData.append("artists", artistRef.current.value);
    formData.append("decription", descRef.current.value.trim());
    if (imageRef.current.files[0]) {
      formData.append("image_file", imageRef.current.files[0]);
    }

    AnxiosInstance.put(`album/${currentId}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => {
        setError({ type: "message", mess: "Cập nhật album thành công", timestamp: Date.now() });
        fetchAlbums();
      })
      .catch((err) => console.log(err));
  };

  // Xoá album
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá album này?")) return;
    AnxiosInstance.delete(`album/${id}/`)
      .then(() => {
        setError({ type: "message", mess: "Đã xoá album", timestamp: Date.now() });
        fetchAlbums();
      })
      .catch((err) => console.log(err));
  };

  // Render bảng album
// Album.jsx (phần render bảng đã sửa)
const renderAlbums = albums.map((album) => (
  <tr key={album.id}>
    <td>{album.title}</td>
    <td>{getArtistName(album.artists)}</td>
    <td>{album.release_date}</td>
    <td>{album.track_count || 0}</td>
    <td>
      <div className="d-flex gap-1 flex-wrap">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => navigate("/admin/viewdetailalbum", { state: { albumId: album.id } })}
        >
          View detail
        </button>
        <button
          className="btn btn-sm btn-outline-warning"
          data-bs-toggle="modal"
          data-bs-target="#albumModal"
          onClick={() => {
            setMode("edit");
            setCurrentId(album.id);
          }}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => handleDelete(album.id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
));
  // Khi mở modal edit, set giá trị cho các input
  useEffect(() => {
    if (mode === "edit" && currentId) {
      const album = albums.find((a) => a.id === currentId);
      if (album && titleRef.current) {
        titleRef.current.value = album.title || "";
        descRef.current.value = album.decription || "";
        artistRef.current.value = album.artists || "";
        // Không thể set file input, giữ nguyên
      }
    } else if (mode === "add") {
      // Reset form
      if (titleRef.current) titleRef.current.value = "";
      if (descRef.current) descRef.current.value = "";
      if (artistRef.current) artistRef.current.value = "";
      // file tự reset khi mở modal mới
    }
  }, [mode, currentId, albums]);

  return (
    <div className="ManageUsers Artists Album">
      <Alert error={error.mess} type={error.type} id={error.timestamp} />
      <h1>Album</h1>

      {/* Search + Add button */}
      <div>
        <label htmlFor="searchAlbum" className="form-label">Search Album:</label>
        <div className="d-flex">
          <div>
            <input
              className="form-control"
              type="search"
              id="searchAlbum"
              placeholder="Name of album"
              onChange={handleSearch}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#albumModal"
            onClick={() => { setMode("add"); setCurrentId(null); }}
          >
            Add New
          </button>
        </div>
      </div>

      {/* Modal thêm / sửa album */}
      <div className="modal" id="albumModal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{mode === "add" ? "Add New" : "Edit"} Album</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div>
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" ref={titleRef} placeholder="Enter name" />
                </div>
                <div>
                  <label className="form-label">Select Artist</label>
                  <select className="form-select" ref={artistRef}>
                    {artists.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" ref={descRef} rows="3" placeholder="Optional"></textarea>
                </div>
                <div>
                  <label className="form-label">Image</label>
                  <input type="file" ref={imageRef} accept="image/*" />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              {mode === "add" && (
                <button type="button" className="btn btn-info" data-bs-dismiss="modal" onClick={handleAdd}>
                  Add
                </button>
              )}
              {mode === "edit" && (
                <button type="button" className="btn btn-info" data-bs-dismiss="modal" onClick={handleUpdate}>
                  Update
                </button>
              )}
              <button type="button" className="btn btn-danger" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng danh sách album */}
      <div className="scroll-table">
        <table className="table table-striped table-bordered table-hover">
<thead>
  <tr>
    <th>Name</th>
    <th>Artist</th>
    <th>Release date</th>
    <th>Total song</th>
    <th>Action</th>   {/* Không cần colspan nữa */}
  </tr>
</thead>
          <tbody>{renderAlbums}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Album;
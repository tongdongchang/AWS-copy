import { useState, useEffect, useCallback } from "react";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

function Track() {
  // Dữ liệu danh sách
  const [audio, setAudio] = useState([]);
  const [video, setVideo] = useState([]);
  const [artistCurrent, setArtist] = useState([]);
  const [albumCurrent, setAlbum] = useState([]);

  // Bộ lọc
  const [categoryFilter, setCategoryFilter] = useState("audio");
  const [premiumFilter, setPremiumFilter] = useState(false); // false = Free, true = Premium

  // Trạng thái form (thay vì dùng ref)
  const initialForm = {
    title: "",
    album: "",
    artists: "",
    category: "audio",
    is_Prenium: false,
    file: null,
    fileImg: null,
  };
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null); // null: add, có id: edit
  const [error, setError] = useState({ type: null, mess: null, timestamp: null });

  // Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // --- Hàm gọi API lấy dữ liệu ---
  const fetchData = useCallback(() => {
    // Lấy audio, video, artist, album
    AnxiosInstance.get("track/?category=audio")
      .then((res) => setAudio(res.data))
      .catch((err) => console.error(err));
    AnxiosInstance.get("track/?category=video")
      .then((res) => setVideo(res.data))
      .catch((err) => console.error(err));
    AnxiosInstance.get("artist/")
      .then((res) => setArtist(res.data))
      .catch((err) => console.error(err));
    AnxiosInstance.get("album/?fields=id,title,image_url,decription")
      .then((res) => setAlbum(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Load lần đầu
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Xử lý tìm kiếm ---
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!value.trim()) {
      // Nếu xóa hết từ khóa -> load lại dữ liệu gốc
      fetchData();
      return;
    }
    // Tìm kiếm
    AnxiosInstance.get("searchFull", {
      params: { category: "audio", title: value },
    })
      .then((res) => setAudio(res.data))
      .catch((err) => console.error(err));
    AnxiosInstance.get("searchFull", {
      params: { category: "video", title: value },
    })
      .then((res) => setVideo(res.data))
      .catch((err) => console.error(err));
  };

  // --- Xóa track ---
  const handleDelete = (id) => {
    AnxiosInstance.delete(`TrackChanging/${id}/`)
      .then(() => {
        // Xóa thành công -> cập nhật lại state cục bộ (hoặc fetch lại)
        setAudio((prev) => prev.filter((item) => item.id !== id));
        setVideo((prev) => prev.filter((item) => item.id !== id));
        // Cũng có thể gọi fetchData để đảm bảo đồng bộ, nhưng xóa cục bộ là đủ
      })
      .catch((err) => {
        setError({ type: "error", mess: "Xóa thất bại", timestamp: Date.now() });
        console.error(err);
      });
  };

  // --- Mở form thêm mới ---
  const handleAddNew = () => {
    setForm(initialForm); // reset form
    setEditingId(null);
  };

  // --- Mở form chỉnh sửa (điền dữ liệu) ---
  const handleEdit = (track) => {
    setForm({
      title: track.title || "",
      album: track.album ? track.album.toString() : "", // album id
      artists: track.artists ? track.artists.toString() : "", // artists id
      category: track.category || "audio",
      is_Prenium: track.is_Prenium ? true : false,
      file: null, // file upload không hiển thị lại
      fileImg: null,
    });
    setEditingId(track.id);
  };

  // --- Thay đổi field form ---
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // --- Submit form (thêm hoặc cập nhật) ---
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("album", form.album);
    formData.append("artists", form.artists);
    formData.append("category", form.category);
    formData.append("is_Prenium", form.is_Prenium ? "true" : "false");
    if (form.file) formData.append("file", form.file);
    if (form.fileImg) formData.append("fileImg", form.fileImg);

    if (editingId) {
      // Update
      AnxiosInstance.put(`TrackChanging/${editingId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(() => {
          setError({ type: "message", mess: "Cập nhật thành công", timestamp: Date.now() });
          fetchData(); // tải lại danh sách
          setForm(initialForm);
          setEditingId(null);
          // Đóng modal (dùng JS thuần)
          const modal = window.bootstrap.Modal.getInstance(document.getElementById("myModal"));
          if (modal) modal.hide();
        })
        .catch((err) => {
          setError({ type: "error", mess: "Lỗi cập nhật", timestamp: Date.now() });
          console.error(err);
        });
    } else {
      // Add new
      AnxiosInstance.post("TrackChanging/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
        .then(() => {
          setError({ type: "message", mess: "Thêm thành công", timestamp: Date.now() });
          fetchData();
          setForm(initialForm);
          const modal = window.bootstrap.Modal.getInstance(document.getElementById("myModal"));
          if (modal) modal.hide();
        })
        .catch((err) => {
          setError({ type: "error", mess: "Lỗi thêm mới", timestamp: Date.now() });
          console.error(err);
        });
    }
  };

  // --- Lọc danh sách theo category và premium ---
  const filteredAudio = audio.filter((a) => {
    if (premiumFilter) return a.is_Prenium === true;
    return a.is_Prenium === false;
  });

  const filteredVideo = video.filter((v) => {
    if (premiumFilter) return v.is_Prenium === true;
    return v.is_Prenium === false;
  });

  // --- Render bảng dựa trên category đang chọn ---
  const renderTable = (dataArray) => {
    if (!dataArray || dataArray.length === 0) {
      return (
        <tr>
          <td colSpan="6">Không có dữ liệu</td>
        </tr>
      );
    }
return dataArray.map((item) => (
  <tr key={item.id}>
    <td>{item.title}</td>
    <td>{typeof item.artists === "object" ? item.artists.name : item.artists}</td>
    <td>{item.release_date}</td>
    <td>
      {item.file ? (
        <a
          href={item.file}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#0d6efd', textDecoration: 'underline' }}
        >
          {item.file.substring(item.file.lastIndexOf("/") + 1)}
        </a>
      ) : (
        "N/A"
      )}
    </td>
    <td>
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
        Delete
      </button>
    </td>
    <td>
      <button
        className="btn btn-warning btn-sm"
        data-bs-toggle="modal"
        data-bs-target="#myModal"
        onClick={() => handleEdit(item)}
      >
        Edit
      </button>
    </td>
  </tr>
));
  };

  return (
    <div className="ManageUsers Track">
      <Alert error={error.mess} type={error.type} id={error.timestamp} />
      <h1>Track Management</h1>

      {/* Bộ lọc */}
      <div className="Track-Category mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-auto">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div className="col-auto">
            <select
              className="form-select"
              value={premiumFilter ? "true" : "false"}
              onChange={(e) => setPremiumFilter(e.target.value === "true")}
            >
              <option value="false">Free</option>
              <option value="true">Premium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tìm kiếm + nút thêm */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="flex-grow-1 me-2">
          <input
            className="form-control"
            type="search"
            placeholder="Search tracks..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#myModal"
          onClick={handleAddNew}
        >
          Add New
        </button>
      </div>

      {/* Bảng */}
      <div className="scroll-table">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Artist</th>
              <th>Release Date</th>
              <th>File</th>
              <th colSpan="2">Action</th>
            </tr>
          </thead>
          <tbody>
            {categoryFilter === "audio"
              ? renderTable(filteredAudio)
              : renderTable(filteredVideo)}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
      <div className="modal fade" id="myModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{editingId ? "Edit Track" : "Add New Track"}</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.title}
                    onChange={(e) => handleFormChange("title", e.target.value)}
                  />
                </div>
                <div className="row">
                  <div className="col">
                    <label className="form-label">Artist</label>
                    <select
                      className="form-select"
                      value={form.artists}
                      onChange={(e) => handleFormChange("artists", e.target.value)}
                    >
                      <option value="">-- Choose artist --</option>
                      {artistCurrent.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label">Album</label>
                    <select
                      className="form-select"
                      value={form.album}
                      onChange={(e) => handleFormChange("album", e.target.value)}
                    >
                      <option value="">-- Choose album --</option>
                      {albumCurrent.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={form.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                    >
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="col">
                    <label className="form-label">Status</label>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="premiumRadio"
                        id="freeRadio"
                        checked={!form.is_Prenium}
                        onChange={() => handleFormChange("is_Prenium", false)}
                      />
                      <label className="form-check-label" htmlFor="freeRadio">
                        Free
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        className="form-check-input"
                        name="premiumRadio"
                        id="premiumRadio"
                        checked={form.is_Prenium}
                        onChange={() => handleFormChange("is_Prenium", true)}
                      />
                      <label className="form-check-label" htmlFor="premiumRadio">
                        Premium
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="form-label">Image (optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => handleFormChange("fileImg", e.target.files[0])}
                  />
                </div>
                <div className="mt-3">
                  <label className="form-label">File (audio/video)</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => handleFormChange("file", e.target.files[0])}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Track;
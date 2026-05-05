import { useState, useEffect, useRef } from "react";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

function Artists() {
  const [artists, setArtists] = useState([]);
  const [mode, setMode] = useState("add"); // "add" | "edit"
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState({ type: null, mess: null, timestamp: null });
  const [editName, setEditName] = useState("");

  const nameRef = useRef(null);

  // Lấy danh sách nghệ sĩ
  const fetchArtists = () => {
    AnxiosInstance.get('artist/')
      .then(res => setArtists(res.data))
      .catch(err => {
        setError({ type: "error", mess: "Không thể tải danh sách nghệ sĩ", timestamp: Date.now() });
        console.error(err);
      });
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  // Mở modal thêm mới
  const handleAddNew = () => {
    setMode("add");
    setCurrentId(null);
    setEditName("");
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Mở modal chỉnh sửa – điền sẵn tên
  const handleEditClick = (artist) => {
    setMode("edit");
    setCurrentId(artist.id);
    setEditName(artist.name);
    setTimeout(() => nameRef.current?.focus(), 100);
  };

  // Gửi request thêm / cập nhật
  const handleSubmit = () => {
    const name = nameRef.current?.value.trim();
    if (!name) {
      setError({ type: "error", mess: "Vui lòng nhập tên nghệ sĩ", timestamp: Date.now() });
      return;
    }

    const formData = new FormData();
    formData.append('name', name);

    if (mode === "add") {
      AnxiosInstance.post('artist/', formData)
        .then(() => {
          setError({ type: "message", mess: "Thêm nghệ sĩ thành công", timestamp: Date.now() });
          fetchArtists();
          closeModal();
        })
        .catch(err => {
          setError({ type: "error", mess: "Lỗi khi thêm nghệ sĩ", timestamp: Date.now() });
          console.error(err);
        });
    } else {
      AnxiosInstance.put(`artist/${currentId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
        .then(() => {
          setError({ type: "message", mess: "Cập nhật thành công", timestamp: Date.now() });
          fetchArtists();
          closeModal();
        })
        .catch(err => {
          setError({ type: "error", mess: "Lỗi khi cập nhật", timestamp: Date.now() });
          console.error(err);
        });
    }
  };

  // Xóa nghệ sĩ
  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nghệ sĩ này?")) return;
    AnxiosInstance.delete(`artist/${id}/`)
      .then(() => {
        setArtists(prev => prev.filter(item => item.id !== id));
        setError({ type: "message", mess: "Đã xóa nghệ sĩ", timestamp: Date.now() });
      })
      .catch(err => {
        setError({ type: "error", mess: "Lỗi khi xóa", timestamp: Date.now() });
        console.error(err);
      });
  };

  // Đóng modal Bootstrap
  const closeModal = () => {
    const modalEl = document.getElementById('artistModal');
    const modal = window.bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  };

  const renderRows = () => {
    if (!artists.length) {
      return (
        <tr>
          <td colSpan="5">Chưa có nghệ sĩ nào</td>
        </tr>
      );
    }
    return artists.map((a) => (
      <tr key={a.id}>
        <td>{a.name}</td>
        <td>{a.total_album}</td>
        <td>{a.total_song}</td>
        <td>
          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)}>
            Delete
          </button>
        </td>
        <td>
          <button
            className="btn btn-sm btn-warning"
            data-bs-toggle="modal"
            data-bs-target="#artistModal"
            onClick={() => handleEditClick(a)}
          >
            Edit
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="ManageUsers Artists">
      <Alert error={error.mess} type={error.type} id={error.timestamp} />

      <h1>Artists</h1>

      <div>
        <label className="form-label">Search Artists:</label>
        <div className="d-flex">
          <input className="form-control me-2" list="artistList" placeholder="Tìm kiếm..." />
          <datalist id="artistList">
            {artists.map(a => <option key={a.id} value={a.name} />)}
          </datalist>
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#artistModal"
            onClick={handleAddNew}
          >
            Add New
          </button>
        </div>
      </div>

      <div className="modal fade" id="artistModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{mode === "add" ? "Add Artist" : "Edit Artist"}</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <label className="form-label">Name:</label>
              <input
                ref={nameRef}
                type="text"
                className="form-control"
                placeholder="Enter name"
                defaultValue={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {mode === "add" ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-table mt-3">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Total Album</th>
              <th>Total Song</th>
              <th>Delete</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Artists;
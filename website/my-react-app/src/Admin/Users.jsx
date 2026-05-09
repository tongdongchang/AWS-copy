import { useState, useEffect } from "react";
import AnxiosInstance from "../prop/GetToken";
import Alert from "../prop/Alert";

/* ─── inline styles cho 3 cột cuối ─────────────────────────────────────────── */
const S = {
  /* Status badge */
  badge: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.4px",
    background: active ? "#d1fae5" : "#fee2e2",
    color: active ? "#065f46" : "#991b1b",
    border: `1px solid ${active ? "#6ee7b7" : "#fca5a5"}`,
    whiteSpace: "nowrap",
  }),
  dot: (active) => ({
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: active ? "#10b981" : "#ef4444",
    flexShrink: 0,
  }),

  /* Lock/Unlock toggle button */
  toggleBtn: (active) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "5px 11px",
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "all 0.18s",
    background: active ? "#fff3cd" : "#e0f2fe",
    color: active ? "#92400e" : "#075985",
    boxShadow: active
      ? "0 1px 4px rgba(251,191,36,0.25)"
      : "0 1px 4px rgba(14,165,233,0.2)",
  }),

  /* Action buttons */
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flexWrap: "nowrap",
    justifyContent: "center",
  },
  iconBtn: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: "7px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
    ...{
      role:  { background: "#e0f2fe", color: "#0369a1" },
      edit:  { background: "#fef9c3", color: "#854d0e" },
      del:   { background: "#fee2e2", color: "#b91c1c" },
    }[color],
  }),

  /* Table cell alignment */
  tdCenter: { verticalAlign: "middle", textAlign: "center" },
};

/* ─── SVG icon helpers ───────────────────────────────────────────────────────── */
const Icon = {
  lock:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  unlock: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>,
  role:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/><path d="M19 11l2 2-4 4"/></svg>,
  edit:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  del:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
};

/* ─── Component ─────────────────────────────────────────────────────────────── */
function Users() {
  const [users, setUsers] = useState([]);
  const [mode, setMode] = useState("add");
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState({ type: null, mess: null, timestamp: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", is_staff: false, is_premium: false,
  });

  const fetchUsers = () => {
    AnxiosInstance.get("admin/users/")
      .then((res) => setUsers(res.data))
      .catch(() =>
        setError({ type: "error", mess: "Không thể tải danh sách người dùng", timestamp: Date.now() })
      );
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddNew = () => {
    setMode("add"); setCurrentId(null);
    setFormData({ username: "", email: "", password: "", is_staff: false, is_premium: false });
  };

  const handleEdit = (user) => {
    setMode("edit"); setCurrentId(user.id);
    setFormData({ username: user.username, email: user.email || "", password: "", is_staff: user.is_staff, is_premium: user.is_premium });
  };

  const handleFormChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const closeModal = () => {
    const el = document.getElementById("userModal");
    const m = window.bootstrap?.Modal?.getInstance(el);
    if (m) m.hide();
  };

  const handleSubmit = () => {
    const payload = {
      username: formData.username, email: formData.email,
      is_staff: formData.is_staff ? "true" : "false",
      is_premium: formData.is_premium ? "true" : "false",
    };
    if (formData.password) payload.password = formData.password;

    if (mode === "add") {
      if (!payload.username || !payload.password) {
        setError({ type: "error", mess: "Username và mật khẩu là bắt buộc", timestamp: Date.now() }); return;
      }
      AnxiosInstance.post("admin/users/", payload)
        .then(() => { setError({ type: "message", mess: "Thêm người dùng thành công", timestamp: Date.now() }); fetchUsers(); closeModal(); })
        .catch((err) => setError({ type: "error", mess: err.response?.data?.error || "Lỗi khi thêm", timestamp: Date.now() }));
    } else {
      AnxiosInstance.put(`admin/users/${currentId}/`, payload)
        .then(() => { setError({ type: "message", mess: "Cập nhật thành công", timestamp: Date.now() }); fetchUsers(); closeModal(); })
        .catch((err) => setError({ type: "error", mess: err.response?.data?.error || "Lỗi khi cập nhật", timestamp: Date.now() }));
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
    AnxiosInstance.delete(`admin/users/${id}/`)
      .then(() => { setUsers((prev) => prev.filter((u) => u.id !== id)); setError({ type: "message", mess: "Đã xóa người dùng", timestamp: Date.now() }); })
      .catch(() => setError({ type: "error", mess: "Lỗi khi xóa", timestamp: Date.now() }));
  };

  const handleToggleActive = (id) => {
    AnxiosInstance.put(`admin/users/${id}/toggle-active/`)
      .then((res) => { setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: res.data.is_active } : u)); setError({ type: "message", mess: "Trạng thái đã thay đổi", timestamp: Date.now() }); })
      .catch(() => setError({ type: "error", mess: "Lỗi khi thay đổi trạng thái", timestamp: Date.now() }));
  };

  const handleToggleStaff = (id) => {
    AnxiosInstance.put(`admin/users/${id}/toggle-staff/`)
      .then((res) => { setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_staff: res.data.is_staff } : u)); setError({ type: "message", mess: "Vai trò đã thay đổi", timestamp: Date.now() }); })
      .catch(() => setError({ type: "error", mess: "Lỗi khi thay đổi vai trò", timestamp: Date.now() }));
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderRows = () => {
    if (!filteredUsers.length)
      return <tr><td colSpan="7" className="text-center py-3 text-muted">Không có người dùng nào</td></tr>;

    return filteredUsers.map((user) => (
      <tr key={user.id}>
        {/* --- các cột bình thường --- */}
        <td style={S.tdCenter}>{user.username}</td>
        <td style={S.tdCenter}>{user.email}</td>
        <td style={S.tdCenter}>{user.is_premium ? "Yes" : "No"}</td>
        <td style={S.tdCenter}>{user.is_staff ? "Admin" : "User"}</td>

        {/* ── 1. Status: badge pill ── */}
        <td style={S.tdCenter}>
          <span style={S.badge(user.is_active)}>
            <span style={S.dot(user.is_active)} />
            {user.is_active ? "Active" : "Locked"}
          </span>
        </td>

        {/* ── 2. Lock / Unlock toggle ── */}
        <td style={S.tdCenter}>
          <button
            style={S.toggleBtn(user.is_active)}
            onClick={() => handleToggleActive(user.id)}
            title={user.is_active ? "Khoá tài khoản" : "Mở khoá tài khoản"}
          >
            {user.is_active ? Icon.lock : Icon.unlock}
            {user.is_active ? "Lock" : "Unlock"}
          </button>
        </td>

        {/* ── 3. Actions: icon button group ── */}
        <td style={S.tdCenter}>
          <div style={S.actionGroup}>
            {/* Role toggle */}
            <button
              style={S.iconBtn("role")}
              title={user.is_staff ? "Chuyển thành User" : "Chuyển thành Admin"}
              onClick={() => handleToggleStaff(user.id)}
            >
              {Icon.role}
            </button>

            {/* Edit */}
            <button
              style={S.iconBtn("edit")}
              title="Chỉnh sửa"
              data-bs-toggle="modal"
              data-bs-target="#userModal"
              onClick={() => handleEdit(user)}
            >
              {Icon.edit}
            </button>

            {/* Delete */}
            <button
              style={S.iconBtn("del")}
              title="Xoá"
              onClick={() => handleDelete(user.id)}
            >
              {Icon.del}
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="ManageUsers">
      <Alert error={error.mess} type={error.type} id={error.timestamp} />
      <h1>Users</h1>

      <div>
        <label className="form-label">Search User:</label>
        <div className="d-flex align-items-center gap-2">
          <input
            className="form-control"
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#userModal"
            onClick={handleAddNew}
          >
            Add New
          </button>
        </div>
      </div>

      {/* ── Modal ── */}
      <div className="modal fade" id="userModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{mode === "add" ? "Add New User" : "Edit User"}</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="form-label">Username:</label>
                  <input type="text" className="form-control" value={formData.username}
                    onChange={(e) => handleFormChange("username", e.target.value)}
                    disabled={mode === "edit"} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input type="email" className="form-control" value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input type="password" className="form-control"
                    placeholder={mode === "edit" ? "Để trống nếu không đổi" : ""}
                    value={formData.password}
                    onChange={(e) => handleFormChange("password", e.target.value)} />
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="isStaffCheck"
                    checked={formData.is_staff}
                    onChange={(e) => handleFormChange("is_staff", e.target.checked)} />
                  <label className="form-check-label" htmlFor="isStaffCheck">Admin</label>
                </div>
                <div className="form-check mb-2">
                  <input className="form-check-input" type="checkbox" id="isPremiumCheck"
                    checked={formData.is_premium}
                    onChange={(e) => handleFormChange("is_premium", e.target.checked)} />
                  <label className="form-check-label" htmlFor="isPremiumCheck">Premium</label>
                </div>
              </form>
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

      {/* ── Table ── */}
      <div className="scroll-table mt-3">
        <table className="table table-striped table-bordered table-hover align-middle">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Premium</th>
              <th>Role</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 100 }}>Lock/Unlock</th>
              <th style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;

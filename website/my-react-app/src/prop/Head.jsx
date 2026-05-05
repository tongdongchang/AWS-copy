import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import Alert from "./Alert";
import img1 from '../assets/no-music.jpg';
import { Link, useNavigate } from "react-router-dom";
import AnxiosInstance from "./GetToken";
import { MusicContext } from "./Home";
import { env } from "../env";

function Head() {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const userIconRef = useRef(null);
    const passwordRef = useRef(null);
    const fileInputRef = useRef(null);   // Ref cho input file
    const imgRef = useRef(null);         // Ref cho thẻ img để preview

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null); // URL preview ảnh mới
    const [profile, setProfile] = useState(null);
    const [alert, setAlert] = useState({ type: null, mess: null, timestamp: null });

    const { setUser } = useContext(MusicContext);
    const navigate = useNavigate();

    // Lấy profile khi mount
    useEffect(() => {
        AnxiosInstance.get('profile/')
            .then(res => {
                setProfile(res.data);
                setUser(res.data);
            })
            .catch(err => console.error('Error loading profile:', err));

        const handleOutside = (event) => {
            if (dropdownRef?.current &&
                userIconRef?.current &&
                !dropdownRef.current.contains(event.target) &&
                !userIconRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('click', handleOutside);
        return () => document.removeEventListener('click', handleOutside);
    }, []);

    // Xử lý chọn file ảnh mới
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile)); // tạo preview
        }
    };

    // Gửi yêu cầu chỉnh sửa profile
    const handleEdit = async () => {
        const password = passwordRef.current?.value.trim();
        if (!password && !file) {
            setAlert({ type: 'error', mess: 'Vui lòng nhập mật khẩu mới hoặc chọn ảnh.', timestamp: Date.now() });
            return;
        }

        const formData = new FormData();
        if (password) formData.append('password', password);
        if (file) formData.append('image_url', file);

        try {
            const res = await AnxiosInstance.post('EditProfile/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Cập nhật lại profile sau khi edit thành công
            const updatedProfile = await AnxiosInstance.get('profile/');
            setProfile(updatedProfile.data);
            setUser(updatedProfile.data);
            setAlert({ type: 'message', mess: 'Cập nhật profile thành công!', timestamp: Date.now() });

            // Reset form
            if (passwordRef.current) passwordRef.current.value = '';
            setFile(null);
            setPreviewUrl(null);
            // Đóng modal (nếu muốn, có thể thêm data-bs-dismiss hoặc dùng JS)
            // Đây dùng Bootstrap modal, có thể close bằng JS: bootstrap.Modal.getInstance(document.getElementById('myModal123')).hide();
            const modalEl = document.getElementById('myModal123');
            if (modalEl) {
                const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();
            }
        } catch (err) {
            console.error('Edit profile error:', err);
            setAlert({ type: 'error', mess: err.response?.data?.error || 'Có lỗi xảy ra', timestamp: Date.now() });
        }
    };

    // Logout
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setProfile(null);
        setUser(null);
        navigate('/login');
    };

    return (
        <div className="nav-header">
            <Alert error={alert.mess} type={alert.type} id={alert.timestamp} />

            <div className="nav-header-icon">
                <i className="fa-solid fa-angle-left"></i>
                <i className="fa-solid fa-angle-left fa-flip-horizontal hide"></i>
            </div>

            <div className="nav-header-user">
                {profile?.is_premium ? (
                    <button>You are premium</button>
                ) : (
                    <button className="badge nav-items hide" onClick={() => navigate('/paypal')}>
                        Explore Premium
                    </button>
                )}

                {profile ? (
                    <img
                        src={profile.image_url ? `${env}/${profile.image_url}` : img1}
                        ref={userIconRef}
                        onClick={() => setOpen(prev => !prev)}
                        width={40}
                        height={40}
                        style={{ borderRadius: '50%', cursor: 'pointer' }}
                        alt="Avatar"
                    />
                ) : (
                    <i
                        className="fa-regular fa-user nav-items"
                        ref={userIconRef}
                        onClick={() => setOpen(prev => !prev)}
                    ></i>
                )}

                {open && (
                    <ul className="dropdown" ref={dropdownRef}>
                        <li>
                            {profile ? (
                                <Link data-bs-toggle="modal" data-bs-target="#myModal123">Profile</Link>
                            ) : (
                                <Link to='/login'>Login</Link>
                            )}
                        </li>
                        <li>
                            {profile ? (
                                <p onClick={handleLogout} style={{ cursor: 'pointer' }}>Log Out</p>
                            ) : (
                                <Link to='/Register'>Register</Link>
                            )}
                        </li>
                    </ul>
                )}
            </div>

            {/* Modal chỉnh sửa profile */}
            <div className="modal" id="myModal123">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Edit Profile</h4>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <input
                                    type="file"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <img
                                    src={previewUrl || (profile?.image_url ? `${env}/${profile.image_url}` : img1)}
                                    width={200}
                                    height={200}
                                    ref={imgRef}
                                    onClick={() => fileInputRef.current.click()}
                                    style={{ cursor: 'pointer', objectFit: 'cover', borderRadius: '8px' }}
                                    alt="Preview"
                                />
                                <div className='modal-body-name mt-3'>
                                    <input
                                        type="password"
                                        className='form-control'
                                        ref={passwordRef}
                                        placeholder='New password (leave blank to keep current)'
                                    />
                                    <label className='form-label'>Password</label>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleEdit}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Head;
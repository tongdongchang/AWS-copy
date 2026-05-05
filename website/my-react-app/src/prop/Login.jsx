import { useState } from "react";
import Alert from "./Alert";
import { Link, useNavigate } from "react-router-dom";
import { env } from "../env";
import axios from "axios";

function Login() {
    const [user, setUser] = useState({ username: '', password: '' });
    const handleUser = (e) => setUser({ ...user, [e.target.name]: e.target.value });
    const [error, setError] = useState({ type: null, mess: null, timestamp: null });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Lấy JWT token
            const tokenRes = await axios.post(`${env}/api/token/`, user);
            const { access, refresh } = tokenRes.data;
            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            setError({ type: 'message', mess: 'Login success', timestamp: Date.now() });

            // Gọi API profile để kiểm tra quyền admin
            const profileRes = await axios.get(`${env}/api/profile/`, {
                headers: { Authorization: `Bearer ${access}` }
            });

            // Nếu tài khoản là admin → chuyển thẳng vào trang /admin
            if (profileRes.data.is_staff) {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError({
                type: 'error',
                mess: err.response?.data?.detail || err.message,
                timestamp: Date.now()
            });
        }
    };

    return (
        <div className="register">
            <div>
                <Alert error={error.mess} type={error.type} id={error.timestamp} />
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="form-label">UserName</label>
                        <input type="text" name="username" className="form-control" onChange={handleUser} />
                    </div>
                    <div>
                        <label className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" onChange={handleUser} />
                    </div>
                    <button type="submit">Login</button>
                </form>
                <Link to='/'>Back to home</Link>
            </div>
        </div>
    );
}

export default Login;
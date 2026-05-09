
import img1 from '../assets/album.jpg';
import { useNavigate } from 'react-router-dom';
function SilderAdmin(){
    const navigate = useNavigate()
return(
    <div className='SliderAdmin'>
        <div className="Avartar">
            <img src={img1} alt="" width={150} height={150}/>
            <h5>Name</h5>
            <p>ABC@gmail.com</p>
        </div>
         <div className="Manage">
        <div className="Dashboard" onClick={()=>navigate('/admin')}>
            <p>📊 Dashboard</p>
        </div>
        <div className="Users" onClick={()=>navigate('/admin/users')}>
            <p>👤 Users</p>
        </div>
        <div className="Tracks"onClick={()=>navigate('/admin/track')}>
            <p>🎵 Tracks</p>
        </div>
        <div className="Albums"onClick={()=>navigate('/admin/album')}>
        <p>💽 Albums</p>
        </div>
        <div className="Artists"onClick={()=>navigate('/admin/artists')}>
        <p>🧑‍🎤 Artists</p>
        </div>
        <div className="LogOut" onClick={()=>navigate('/')}>
        <p>⬅️ Log Out</p>
        </div>
    </div>
    </div>
   
)
}
export default SilderAdmin
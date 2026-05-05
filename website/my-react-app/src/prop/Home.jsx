import Slider from "./Slider"
import MusicPlayer from "./MusicPlayer"
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { createContext, useContext, useState, useRef } from "react";
export const MusicContext = createContext();

function Home() {
  const [data, setData] = useState({})
  const [reloading, setReload] = useState(false)
  const [user, setUser] = useState()
  const [queue, setQueue] = useState([])         // danh sách bài
  const [currentIndex, setCurrentIndex] = useState(-1)  // index hiện tại

  // Ghi đè setData để đồng thời cập nhật queue + index
  const playTrack = (track, trackList = null) => {
    if (trackList) {
      setQueue(trackList)
      const idx = trackList.findIndex(t => t.file === track.file)
      setCurrentIndex(idx >= 0 ? idx : 0)
    }
    setData(track)
  }

  return (
    <div className="container">
      <MusicContext.Provider value={{
        data, setData, reloading, setReload, user, setUser,
        queue, setQueue, currentIndex, setCurrentIndex, playTrack
      }}>
        <Slider />
        <Outlet />
        <MusicPlayer />
      </MusicContext.Provider>
    </div>
  )
}
export default Home
import img2 from '../assets/heart-line.png';
import img3 from '../assets/controls5.png';
import { useState, useEffect, useRef, useContext } from 'react';
import { MusicContext } from './Home'

function MusicPlayer() {
  const [currentTime, setcurrentTime] = useState(0)
  const [maxTime, setmaxTime] = useState(0)
  const { data, setData, queue, currentIndex, setCurrentIndex } = useContext(MusicContext);
  const [isPlay, setIsPlay] = useState(false)
  const audioRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    audio.addEventListener('loadedmetadata', () => setmaxTime(audio.duration))
    audio.addEventListener('timeupdate', () => {
      setcurrentTime(audio.currentTime)
      if (progressRef.current) {
        progressRef.current.value = (audio.currentTime / audio.duration) * 100
      }
    })
    audio.addEventListener('canplay', () => { audio.play(); setIsPlay(true) })
  }, [])

  // Khi data thay đổi (bài mới) → tự động play
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !data.file) return
    audio.load()
    // canplay event sẽ tự play
  }, [data.file])

  const handlePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!isPlay) {
      audio.play()
    } else {
      audio.pause()
    }
    setIsPlay(!isPlay)
  }

  // ← Previous
  const handlePrev = () => {
    if (!queue.length) return
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : queue.length - 1
    setCurrentIndex(prevIndex)
    setData(queue[prevIndex])
  }

  // → Next
  const handleNext = () => {
    if (!queue.length) return
    const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(nextIndex)
    setData(queue[nextIndex])
  }

  const handlesProgess = (e) => {
    const audio = audioRef.current
    const seekTime = (e.target.value / 100) * maxTime
    audio.currentTime = seekTime;
    setcurrentTime(seekTime)
  }

  const fomat = (time) => {
    if (isNaN(time)) return "00:00";
    const minute = Math.floor(time / 60)
    const second = Math.floor(time % 60)
    return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`
  }

  const handleVolume = (e) => {
    const audio = audioRef.current;
    audio.volume = parseFloat(e.target.value);
  }

  return (
    <>
      <div className="music-player">
        <div className="album">
          <img src={data.image_url} alt="No music" />
          <div className="name">
            <h6>{data.title}</h6>
            <p>{data.artists}</p>
          </div>
          <img src={img2} alt="" className="heart" />
        </div>

        <div className="Player">
          <div className="playercontrol">
            {/* Previous */}
            <i
              className="fa-solid fa-backward-step"
              onClick={handlePrev}
              style={{ cursor: queue.length > 0 ? 'pointer' : 'default', opacity: queue.length > 0 ? 1 : 0.4 }}
            />

            {isPlay
              ? <i className="fa-solid fa-pause run" onClick={handlePlay} />
              : <i className="fa-regular fa-circle-play run" onClick={handlePlay} />
            }

            {/* Next */}
            <i
              className="fa-solid fa-forward-step"
              onClick={handleNext}
              style={{ cursor: queue.length > 0 ? 'pointer' : 'default', opacity: queue.length > 0 ? 1 : 0.4 }}
            />
          </div>

          <div className="player-bar">
            <audio
              ref={audioRef}
              src={data.file}
              onEnded={() => { setIsPlay(false); handleNext() }} // tự next khi hết bài
            />
            <span className="curr-time">{fomat(currentTime)}</span>
            <input type="range" min="0" max="100" className="progress-bar" ref={progressRef} onChange={handlesProgess} />
            <span className="tot-time">{fomat(maxTime)}</span>
          </div>
        </div>

        <div className="controller">
          <img src={img3} alt="" className="heart" />
          <input type="range" min="0" max="1" className="progress-bar1" step='0.1' onChange={handleVolume} />
        </div>
      </div>
    </>
  )
}
export default MusicPlayer
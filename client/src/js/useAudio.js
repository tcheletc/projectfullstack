import { useState, useEffect, useMemo } from "react";
const useAudio = url => {
    const audio = useMemo(() => new Audio(url), []);
    const [playing, setPlaying] = useState(false);
    
    useEffect(() => {
        playing ? audio.play() : audio.pause();
      },
      [playing]
    );
  
    useEffect(() => {
      audio.addEventListener('ended', () => setPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setPlaying(false));
      };
    }, []);
  
    return [playing, setPlaying];
};

export default useAudio;
  
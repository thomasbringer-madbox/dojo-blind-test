import logo from './assets/logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { getUsersSavedTracks } from './lib/spotify/api/tracks/tracks';
import { GetUsersSavedTracksParams } from './lib/spotify/model';

const apiToken =
  'BQBGxAxQw8FbPMB3HK88AObRsRGnMwKqJ35IWG2Ynrg7202jS8swAwmVmn_uSOxuGP6G9wJXR_VQ5NFPCT2kTj22vCC-UaSwuRmqHzgQOuu3zC5KuDlQC5RYQoqTWIjmXSPVrzHYHD1t52MZFTAC7Fw_pla10yMQ1ZSan_m9EvhlLW4HDLrIrYBa2zLSCG0x-y4WuJTK81DqdB8qHY_D5BELgo-nCpsMHSD0f9imv0iu3GaCZK_WHYIzQcUW__Eo-1Seqe6iM3yBbUTHj_cCoRM-9BIjXSAOKKQEF2M7cZZKkxEWpmJx0ISYrQwtYIPi34kOwStnaOPQMihu6OCiV8u7DKSgjuhN3UDIrlri841bLAyo21NeCrRGVX4Bjtm_qscu7BEiG1-GB-xB_LepWk_tn1c';

const pickRandomTrack = (tracks: any[]) => {
  return tracks[Math.floor(Math.random() * tracks.length)]!;
};

const shuffleArray = (tracks: any[]) => {
  return tracks.sort(() => Math.random() - 0.5);
};

const AlbumCover = ({ track }: { track: any }) => {
  return (
    <img
      src={track.album.images?.[0]?.url ?? ''}
      style={{ width: 200, height: 200 }}
    />
  );
};

const TrackButton = ({
  track,
  onClick,
}: {
  track: any;
  onClick: () => void;
}) => {
  return (
    <div className="App-track-button">
      <AlbumCover track={track.track} />
      <button onClick={onClick}>{track.track?.name}</button>
    </div>
  );
};

const App = () => {
  const {
    data: tracks,
    isSuccess,
    isLoading,
  } = useQuery({
    queryKey: ['tracks'],
    queryFn: async () => {
      const params: GetUsersSavedTracksParams = { limit: 20 };
      const response = await getUsersSavedTracks(
        { limit: 20 },
        { headers: { Authorization: `Bearer ${apiToken}` } }
      );      
      return response.data.items;
    },
  });

  const [currentTrack, setCurrentTrack] = useState<any | undefined>(
    undefined
  );
  const [trackChoices, setTrackChoices] = useState<any[]>([]);

  useEffect(() => {
    if (!tracks) return;

    const rightTrack = pickRandomTrack(tracks);
    setCurrentTrack(rightTrack);

    const wrongTracks = [pickRandomTrack(tracks), pickRandomTrack(tracks)];
    const choices = shuffleArray([rightTrack, ...wrongTracks]);
    setTrackChoices(choices);
  }, [tracks]);

  const checkAnswer = (track: any) => {
    if (track.track?.id == currentTrack?.track?.id) {
      swal('Bravo !', "C'est la bonne réponse", 'success');
    } else {
      swal('Dommage !', "Ce n'est pas la bonne réponse", 'error');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Bienvenue sur le blind test</h1>
      </header>
      <div className="App-images">
        {isLoading || !isSuccess ? (
          'Loading...'
        ) : (
          <div>
            <div>
              <audio
                src={currentTrack?.track?.preview_url ?? ''}
                controls
                autoPlay
              />
            </div>
          </div>
        )}
      </div>
      <div className="App-buttons">
        {trackChoices.map(track => (
          <TrackButton track={track} onClick={() => checkAnswer(track)} />
        ))}
      </div>
    </div>
  );
};

export default App;

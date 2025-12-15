import logo from './assets/logo.svg';
import './App.css';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';
import { getUsersSavedTracks } from './lib/spotify/api/tracks/tracks';
import { GetUsersSavedTracksParams } from './lib/spotify/model';

const apiToken =
  'BQByjEIC7tB87XU7Gzw_5pc5ZuCnLSkQHRNbnmdWunLpAeqIs1kBtKa0_TVNTSSLamxLEq7aSh3gxSEDDGgeI2ev5yjnXp_hE3f63Ujilz6IG80MoQXZTPZ-y_JnnftpeKK87KiFy3CtD6aRKCwTgjzA_hyopQqrvS0qZEVEJ-V1dnJXLuzrm2zOySnoCJQqtqDpAjxvWUULSpMuyV79bIuJrv1lSVFhl5PzMYR3dQWUmRKsa1P8wc4_D_JNqW3Qoszl6dlz6BUtkeTmVSw8s3IL5K9TJ5la64nF2QaHZ6YYGPIY9vBoQmwmhc9rYOmWPdfEO759-jwmdJFBYQFofZieC_Mt8JpTzYwtC55bOlfkga4YD7MnDCDl2xFIEyi9vkoc2QX-crtlH1sk6nYae2CKhGU';

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

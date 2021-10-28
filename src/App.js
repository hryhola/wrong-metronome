import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

import { Slider, FormRadio, Button } from 'shards-react';

const worker = new Worker('bpm-worker.js');
const context = new (window.AudioContext || window.webkitAudioContext)();

function App() {
  const sounds = useRef({ 'beat.mp3': null });

  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(true);
  const [soundEffect, setSoundEffect] = useState('high-tick.mp3');
  const [tilt, setTilt] = useState(5);
  const [visibleTilt, setVisibleTilt] = useState(false);

  const handleTiltSet = ({ target }) => {
    if (+target.value < 0 || +target.value > 200) return;
    setTilt(parseInt(target.value));
    worker.postMessage({ type: 'set_tilt', value: parseInt(target.value) });
  };

  const handleSlide = (e) => {
    setBpm(parseInt(e[0]));
  };

  const handleChange = (e) => {
    worker.postMessage({ type: 'set_bpm', value: parseInt(e[0]) });
    console.log(parseInt(e[0]));
  };

  const handleToggleClick = () => {
    setPlaying(!playing);
    worker.postMessage({ type: 'toggle_playing' });
  };

  function play(audioBuffer) {
    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.start();
  }

  useEffect(() => {
    if (!sounds.current[soundEffect]) {
      fetch(`http://localhost:3000/${soundEffect}`)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          sounds.current[soundEffect] = audioBuffer;
        });
    }
  }, [soundEffect]);

  useEffect(() => {
    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'beep': {
          play(sounds.current[soundEffect]);
          break;
        }
        default:
          break;
      }
    };
  });

  useEffect(() => {
    let keysPressed = {};
    document.addEventListener('keydown', (event) => {
      keysPressed[event.key] = true;

      if (keysPressed['q'] && keysPressed['e'] && keysPressed['t']) {
        setVisibleTilt(true);
      }
    });

    document.addEventListener('keyup', (event) => {
      delete keysPressed[event.key];
    });
  });

  return (
    <div className='App'>
      <div className='bpm-title'>
        <h1>{bpm} bpm</h1>
      </div>
      <div className='bpm-slider-container'>
        <Slider
          className='bpm-slider'
          start={[bpm]}
          range={{ min: 30, max: 250 }}
          theme='secondary'
          pips={{ mode: 'steps', stepped: true, density: 10 }}
          onSlide={handleSlide}
          onChange={handleChange}
        />
        <div className='controls'>
          <Button
            className='button-toggle'
            theme='secondary'
            onClick={handleToggleClick}
          >
            Stop/Play
          </Button>
          <FormRadio
            theme='secondary'
            name='beat'
            checked={soundEffect === 'beat.mp3'}
            onChange={() => setSoundEffect('beat.mp3')}
          >
            Side stick
          </FormRadio>
          <FormRadio
            theme='secondary'
            name='beat'
            checked={soundEffect === 'high-tick.mp3'}
            onChange={() => setSoundEffect('high-tick.mp3')}
          >
            High tick
          </FormRadio>
          <FormRadio
            theme='secondary'
            name='beat'
            checked={soundEffect === 'mafiozi.mp3'}
            onChange={() => setSoundEffect('mafiozi.mp3')}
          >
            Mafiozi
          </FormRadio>
          <FormRadio
            theme='secondary'
            name='beat'
            checked={soundEffect === 'gachi.flac'}
            onChange={() => setSoundEffect('gachi.flac')}
          >
            Gachi
          </FormRadio>

          {visibleTilt && (
            <div className='tilt'>
              <span className='tilt-title'>Tilt (margin of error): </span>
              <input
                className='tilt-input'
                type='number'
                value={tilt}
                onChange={handleTiltSet}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

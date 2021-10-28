/* eslint-disable no-restricted-globals */
async function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

class Options {
  _playing = false;
  _bpm = 120;
  _tilt = 5;
  get tempo() {
    return this._bpm;
  }
  set tempo(value) {
    if (typeof value !== 'number') return;
    if (value <= 30) this._bpm = 33;
    if (value >= 250) this._bpm = 240;
    this._bpm = value;
  }
  get isPlaying() {
    return this._playing;
  }
  set isPlaying(val) {
    if (typeof val === 'boolean') this._playing = val;
  }
  get tilt() {
    return this._tilt;
  }
  set tilt(val) {
    if (typeof val === 'number' && !isNaN(val)) this._tilt = val;
  }
}

const options = new Options();

self.addEventListener('message', function ({ data }) {
  switch (data.type) {
    case 'set_bpm': {
      options.tempo = data.value;
      break;
    }
    case 'set_tilt': {
      options.tilt = data.value;
      break;
    }
    case 'toggle_playing': {
      options.isPlaying = !options.isPlaying;
      break;
    }
    default:
      break;
  }
});

const Metronome = async () => {
  while (true) {
    if (options.isPlaying) {
      self.postMessage({ type: 'beep' });
      const randomBpm = getRandomArbitrary(
        options.tempo - options.tilt,
        options.tempo + options.tilt
      );
      const currentBpm = options.tilt === 0 ? options.tempo : randomBpm;
      // console.log(currentBpm);
      await sleep(60 / currentBpm);
    } else {
      await sleep(0.25);
    }
  }
};

Metronome();

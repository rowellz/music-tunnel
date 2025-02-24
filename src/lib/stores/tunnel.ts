import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Configuration object for all store settings
const storeConfig = {
  numPoints: { key: 'numPoints', default: 50, parse: v => parseInt(v, 10) },
  speed: { key: 'speed', default: 0.0000075, parse: v => parseFloat(v) },
  numRings: { key: 'numRings', default: 600, parse: v => parseInt(v, 10) },
  size: { key: 'size', default: 0.1, parse: v => parseFloat(v) },
  ringSize: { key: 'ringSize', default: 8, parse: v => parseInt(v, 10) },
  color: { key: 'color', default: '#C547FF', parse: v => v?.toString() },
  isRainbow: { key: 'isRainbow', default: false, parse: v => v === 'true' },
  isAnimating: { key: 'isAnimating', default: false, parse: v => v === 'true' },
  animationSpeed: { key: 'animationSpeed', default: 100, parse: v => parseFloat(v) },
  isPointSizeAnimating: { key: 'isPointSizeAnimating', default: false, parse: v => v === 'true' },
  pointSizeAnimatingSpeed: { key: 'pointSizeAnimatingSpeed', default: 100, parse: v => parseFloat(v) },
  isRingCountAnimating: { key: 'isRingCountAnimating', default: false, parse: v => v === 'true' },
  ringCountAnimatingSpeed: { key: 'ringCountAnimatingSpeed', default: 100, parse: v => parseFloat(v) },
  isPointCountAnimating: { key: 'isPointCountAnimating', default: false, parse: v => v === 'true' },
  pointCountAnimatingSpeed: { key: 'pointCountAnimatingSpeed', default: 100, parse: v => parseFloat(v) }
};

// Create stores and subscriptions in a single loop
export const stores = {};
Object.entries(storeConfig).forEach(([name, { key, default: defaultValue, parse }]) => {
  stores[name] = writable(
    browser ? (localStorage.getItem(key) ? parse(localStorage.getItem(key)) : defaultValue) : defaultValue
  );
  stores[name].subscribe(value => {
    if (browser) localStorage.setItem(key, value.toString());
  });
});

// Export individual stores for convenience
export const {
  numPoints, speed, numRings, size, ringSize, color, isRainbow, isAnimating,
  animationSpeed, isPointSizeAnimating, pointSizeAnimatingSpeed, isRingCountAnimating,
  ringCountAnimatingSpeed, isPointCountAnimating, pointCountAnimatingSpeed
} = stores;

// Audio-related stores
// export const audioData = writable(null);
// export const audioContext = writable(null);
// export const analyser = writable(null);
// export const isAudioAnalyzing = writable(false);

// Generic animation handler
const createAnimation = (store, speedStore, config) => {
  let intervalId = null;
  let direction = 1;

  const update = () => {
    store.update(current => {
      let newValue = current + config.step * direction;
      if (newValue >= config.max || newValue <= config.min) direction *= -1;
      return Math.max(config.min, Math.min(config.max, newValue));
    });
  };

  const start = () => {
    if (intervalId) clearInterval(intervalId);
    const unsubscribe = speedStore.subscribe(speed => {
      clearInterval(intervalId);
      intervalId = setInterval(update, speed);
    });
    return () => {
      clearInterval(intervalId);
      unsubscribe();
    };
  };

  const stop = () => {
    if (intervalId) clearInterval(intervalId);
    intervalId = null;
  };

  return { start, stop };
};

// Animation configurations
const animations = {
  ringSize: {
    store: ringSize,
    speedStore: animationSpeed,
    config: { step: 1, min: 1, max: 20 },
    trigger: isAnimating
  },
  size: {
    store: size,
    speedStore: pointSizeAnimatingSpeed,
    config: { step: 0.1, min: 0.5, max: 1.5 },
    trigger: isPointSizeAnimating
  },
  numRings: {
    store: numRings,
    speedStore: ringCountAnimatingSpeed,
    config: { step: 1, min: 100, max: 1000 },
    trigger: isRingCountAnimating
  },
  numPoints: {
    store: numPoints,
    speedStore: pointCountAnimatingSpeed,
    config: { step: 1, min: 8, max: 50 },
    trigger: isPointCountAnimating
  }
};

// Initialize animations
const animationControls = Object.fromEntries(
  Object.entries(animations).map(([key, { store, speedStore, config, trigger }]) => {
    const { start, stop } = createAnimation(store, speedStore, config);
    trigger.subscribe(value => value ? start() : stop());
    return [key, { start, stop }];
  })
);

// Audio setup
// export function setupAudioAnalysis() {
//   if (!browser) return;
//   const context = new (window.AudioContext || window.webkitAudioContext)();
//   const analyserNode = context.createAnalyser();
//   analyserNode.fftSize = 128;
//   analyserNode.smoothingTimeConstant = 0.8;
//   const bufferLength = analyserNode.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);

//   audioContext.set(context);
//   analyser.set(analyserNode);

//   return { bufferLength, dataArray };
// }

// // Process audio file
// export async function processAudioFile(file) {
//   try {
//     const context = new (window.AudioContext || window.webkitAudioContext)();
//     const audioBuffer = await context.decodeAudioData(await file.arrayBuffer());
//     audioData.set(audioBuffer);

//     const source = context.createBufferSource();
//     source.buffer = audioBuffer;

//     const analyserNode = context.createAnalyser();
//     analyserNode.fftSize = 128;
//     analyserNode.smoothingTimeConstant = 0.8;

//     source.connect(analyserNode);
//     analyserNode.connect(context.destination);

//     audioContext.set(context);
//     analyser.set(analyserNode);

//     source.start();
//     isAudioAnalyzing.set(true);
//     const cleanupAudioAnalysis = analyzeAudioOptimized();

//     source.onended = () => {
//       isAudioAnalyzing.set(false);
//       cleanupAudioAnalysis();
//       context.close();
//     };
//   } catch (error) {
//     console.error('Error processing audio:', error);
//   }
// }

// // Optimized audio analysis
// function analyzeAudioOptimized() {
//   let animationId = null;
//   let lastUpdate = 0;
//   const minUpdateInterval = 100;

//   const update = timestamp => {
//     if (timestamp - lastUpdate < minUpdateInterval) {
//       animationId = requestAnimationFrame(update);
//       return;
//     }

//     analyser.subscribe(analyserNode => {
//       if (!analyserNode) return;
//       const bufferLength = analyserNode.frequencyBinCount;
//       const dataArray = new Uint8Array(bufferLength);
//       analyserNode.getByteFrequencyData(dataArray);

//       const sampleSize = Math.floor(bufferLength / 4);
//       const average = Array.from(dataArray.slice(0, sampleSize)).reduce((sum, val) => sum + val, 0) / sampleSize;
//       const newSize = 0.5 + (average / 255) * 1.0;
//       size.set(Math.max(0.5, Math.min(1.5, newSize)));
//       lastUpdate = timestamp;
//     });

//     if (isAudioAnalyzing) animationId = requestAnimationFrame(update);
//   };

//   const unsubscribe = isAudioAnalyzing.subscribe(value => {
//     if (value && !animationId) animationId = requestAnimationFrame(update);
//     else if (!value && animationId) {
//       cancelAnimationFrame(animationId);
//       animationId = null;
//     }
//   });

//   return () => {
//     if (animationId) cancelAnimationFrame(animationId);
//     unsubscribe();
//   };
// }



export const audioData = writable(null); // Now holds the Audio element instead of buffer
export const audioContext = writable(null);
export const analyser = writable(null);
export const isAudioAnalyzing = writable(false);

// Process audio file with streaming
export async function processAudioFile(file) {
  if (!browser) return;

  try {
    // Create an Audio element instead of decoding the full buffer
    const audioElement = new Audio(URL.createObjectURL(file));
    audioElement.preload = 'auto'; // Let browser manage buffering

    const context = new (window.AudioContext || window.webkitAudioContext)();
    const source = context.createMediaElementSource(audioElement);
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;

    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    // Store references
    audioData.set(audioElement);
    audioContext.set(context);
    analyser.set(analyserNode);

    console.log(source)
    // Start playback
    audioElement.play();
    isAudioAnalyzing.set(true);
    const cleanupAudioAnalysis = analyzeAudioOptimized();

    // Cleanup when the song ends
    audioElement.onended = () => {
      isAudioAnalyzing.set(false);
      cleanupAudioAnalysis();
      source.disconnect();
      analyserNode.disconnect();
      context.close().then(() => {
        audioContext.set(null);
        analyser.set(null);
        audioData.set(null); // Clear the audio element
        URL.revokeObjectURL(audioElement.src); // Release the object URL
      });
    };

    // Handle errors
    audioElement.onerror = () => {
      console.error('Audio playback error:', audioElement.error);
      cleanup();
    };

    function cleanup() {
      isAudioAnalyzing.set(false);
      cleanupAudioAnalysis();
      if (audioElement) {
        audioElement.pause();
        URL.revokeObjectURL(audioElement.src);
      }
      context.close();
    }

  } catch (error) {
    console.error('Error processing audio:', error);
    isAudioAnalyzing.set(false);
    audioData.set(null);
  }
}

// Optimized audio analysis (unchanged, but included for completeness)
function analyzeAudioOptimized() {
  let animationId = null;
  let lastUpdate = 0;
  const minUpdateInterval = 16; // ~60 FPS for smoother updates
  let currentSize = 1; // Initial size

  const update = timestamp => {
    if (timestamp - lastUpdate < minUpdateInterval) {
      animationId = requestAnimationFrame(update);
      return;
    }

    analyser.subscribe(analyserNode => {
      if (!analyserNode) return;
      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteFrequencyData(dataArray);

      // Use a larger sample of frequency bins for more data
      const sampleSize = Math.floor(bufferLength / 2); // Half the bins for broader analysis
      const average = Array.from(dataArray.slice(0, sampleSize)).reduce((sum, val) => sum + val, 0) / sampleSize;

      // Non-linear scaling to exaggerate subtle changes
      const normalized = average / 255;
      const targetSize = 0.1 + Math.pow(normalized, 0.9) * 5; // Exponential scaling, adjust exponent and multiplier

      // Faster interpolation for quicker response
      currentSize += (targetSize - currentSize) * 0.4; // Increase from 0.2 to 0.4

      // Wider dynamic range
      size.set(Math.max(0.1, Math.min(30, currentSize)));

      lastUpdate = timestamp;
    });

    animationId = requestAnimationFrame(update);
  };

  const unsubscribe = isAudioAnalyzing.subscribe(value => {
    if (value && !animationId) animationId = requestAnimationFrame(update);
    else if (!value && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });

  return () => {
    if (animationId) cancelAnimationFrame(animationId);
    unsubscribe();
  };
}

isAudioAnalyzing.subscribe(isAnalyzing => {
  if (isAnalyzing) {
    numPoints.set(24);
    speed.set(0.0000845);
    numRings.set(600);
    ringSize.set(12);
  } else {
    // Optionally reset to defaults or keep the last values
    numPoints.set(storeConfig.numPoints.default);
    speed.set(storeConfig.speed.default);
    numRings.set(storeConfig.numRings.default);
    ringSize.set(storeConfig.ringSize.default);
  }
});

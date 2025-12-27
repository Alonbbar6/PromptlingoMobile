// Audio utility functions

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (duration: number): string => {
  if (duration < 60) {
    return `${Math.floor(duration)}s`;
  }
  return formatTime(duration);
};

export const getAudioLevel = (analyser: AnalyserNode): number => {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  
  const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
  return average / 255; // Normalize to 0-1
};

export const createAudioContext = (): AudioContext | null => {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch (error) {
    console.error('Failed to create AudioContext:', error);
    return null;
  }
};

export const createAnalyser = (audioContext: AudioContext, source: MediaStreamAudioSourceNode): AnalyserNode => {
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  source.connect(analyser);
  return analyser;
};

export const compressAudio = async (audioBlob: Blob, maxSizeMB: number = 10): Promise<Blob> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (audioBlob.size <= maxSizeBytes) {
    return audioBlob;
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(audioBlob);
    
    audio.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Create a simple compression by reducing quality
      // const compressionRatio = Math.sqrt(maxSizeBytes / audioBlob.size);
      
      // For now, just return the original blob
      // In a real implementation, you'd use Web Audio API to compress
      URL.revokeObjectURL(url);
      resolve(audioBlob);
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio'));
    };
    
    audio.src = url;
  });
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 25 * 1024 * 1024; // 25MB
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/mp4',
    'audio/mpeg',
    'audio/mpga',
    'audio/m4a',
    'audio/wav',
    'audio/webm'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 25MB.' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please select an audio file.' };
  }

  return { valid: true };
};

export const downloadAudio = (audioUrl: string, filename: string = 'translation.mp3'): void => {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

export const getSupportedAudioFormats = (): string[] => {
  const audio = document.createElement('audio');
  const formats = [];
  
  if (audio.canPlayType('audio/mpeg')) formats.push('mp3');
  if (audio.canPlayType('audio/wav')) formats.push('wav');
  if (audio.canPlayType('audio/ogg')) formats.push('ogg');
  if (audio.canPlayType('audio/mp4')) formats.push('m4a');
  if (audio.canPlayType('audio/webm')) formats.push('webm');
  
  return formats;
};

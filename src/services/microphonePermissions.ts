// Comprehensive microphone permission handling and diagnostics

export interface MicrophonePermissionResult {
    success: boolean;
    stream?: MediaStream;
    error?: string;
    permissionState?: PermissionState;
}

export async function requestMicrophonePermission(): Promise<MicrophonePermissionResult> {
    console.log('🎤 Requesting microphone permission...');
    
    try {
        // Check if permissions API is available
        if ('permissions' in navigator) {
            try {
                const permissionStatus = await navigator.permissions.query({ 
                    name: 'microphone' as PermissionName 
                });
                
                console.log('Microphone permission status:', permissionStatus.state);
                
                if (permissionStatus.state === 'denied') {
                    return {
                        success: false,
                        error: 'Microphone permission is denied. Please enable it in your browser settings.',
                        permissionState: permissionStatus.state
                    };
                }
            } catch (permError) {
                console.warn('Permission API not fully supported:', permError);
            }
        }

        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return {
                success: false,
                error: 'Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.'
            };
        }

        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Request audio stream with optimal settings
        // Use 'ideal' constraints for mobile compatibility instead of exact requirements
        console.log('📡 Requesting audio stream...');
        console.log('Device type:', isMobile ? 'Mobile' : 'Desktop');

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: isMobile ? {
                // Mobile-friendly constraints (more relaxed)
                echoCancellation: true,       // Remove echo
                noiseSuppression: true,       // Remove background noise
                autoGainControl: true,        // Normalize volume
            } : {
                // Desktop constraints (more specific)
                channelCount: { ideal: 1 },              // Prefer mono for speech
                sampleRate: { ideal: 48000 },            // Prefer high quality
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            }
        });

        console.log('✅ Microphone access granted');
        console.log('Audio tracks:', stream.getAudioTracks().length);
        
        // Verify stream is active
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length === 0) {
            stream.getTracks().forEach(track => track.stop());
            return {
                success: false,
                error: 'No audio tracks found in the stream. Please check your microphone connection.'
            };
        }

        const audioTrack = audioTracks[0];
        console.log('Audio track state:', audioTrack.readyState);
        console.log('Audio track enabled:', audioTrack.enabled);
        console.log('Track settings:', audioTrack.getSettings());
        
        if (audioTrack.readyState !== 'live') {
            stream.getTracks().forEach(track => track.stop());
            return {
                success: false,
                error: 'Audio track is not active. Please check your microphone and try again.'
            };
        }

        // Test if we can actually get audio data
        const testResult = await testAudioStream(stream);
        if (!testResult.success) {
            stream.getTracks().forEach(track => track.stop());
            return {
                success: false,
                error: testResult.error || 'Audio stream test failed'
            };
        }

        return {
            success: true,
            stream,
            permissionState: 'granted'
        };

    } catch (error: any) {
        console.error('❌ Microphone access failed:', error);
        
        // Provide user-friendly error messages based on error type
        let errorMessage = 'Unknown microphone error occurred.';
        
        switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
                const isMobileDev = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                errorMessage = isMobileDev
                    ? `Microphone access denied on mobile. Please:

**For iPhone/iPad (Safari):**
1. Tap the "aA" icon in the address bar
2. Select "Website Settings"
3. Enable "Microphone"
4. Refresh this page

**For Android (Chrome):**
1. Tap the lock 🔒 icon in the address bar
2. Tap "Permissions"
3. Allow "Microphone"
4. Refresh this page

If blocked permanently: Go to your browser Settings → Site Settings → Microphone`
                    : `Microphone access denied. Please:

1. Click the 🔒 lock icon in the address bar
2. Allow microphone access
3. Refresh the page

If the problem persists, check your browser settings.`;
                break;
                
            case 'NotFoundError':
                errorMessage = `No microphone found. Please:

1. Connect a microphone to your device
2. Check that it's properly connected
3. Try refreshing the page

If using headphones, make sure they have a built-in microphone.`;
                break;
                
            case 'NotReadableError':
                errorMessage = `Microphone is being used by another application. Please:

1. Close other apps that might be using the microphone
2. Close other browser tabs with audio/video calls
3. Restart your browser
4. Try again`;
                break;
                
            case 'OverconstrainedError':
                errorMessage = `Microphone doesn't support the required settings. Please:

1. Try using a different microphone
2. Check your audio drivers are up to date
3. Try refreshing the page`;
                break;
                
            case 'SecurityError':
                const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                errorMessage = isMobileDevice
                    ? `Security error accessing microphone on mobile. Please:

1. Make sure you're using HTTPS (check for 🔒 in address bar)
2. For iOS: Go to Settings → Safari → Camera & Microphone Access → Enable
3. For Android: Go to Site Settings → Microphone → Allow
4. Try refreshing the page`
                    : `Security error accessing microphone. Please:

1. Make sure you're using HTTPS (not HTTP)
2. Check your browser security settings
3. Try refreshing the page`;
                break;
                
            case 'TypeError':
                errorMessage = `Browser compatibility issue. Please:

1. Update your browser to the latest version
2. Try using Chrome, Firefox, or Safari
3. Check if your browser supports audio recording`;
                break;
                
            default:
                errorMessage = `Microphone error (${error.name}): ${error.message}

Please try:
1. Refreshing the page
2. Checking your microphone connection
3. Using a different browser`;
        }
        
        return {
            success: false,
            error: errorMessage
        };
    }
}

async function testAudioStream(stream: MediaStream): Promise<{ success: boolean; error?: string }> {
    console.log('🧪 Testing audio stream...');
    
    try {
        // Create a temporary audio context to test the stream
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        
        source.connect(analyser);
        analyser.fftSize = 256;
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        // Test for 500ms to see if we get any audio data
        return new Promise((resolve) => {
            let hasAudioData = false;
            let testCount = 0;
            const maxTests = 10; // Test for 500ms (50ms * 10)
            
            const testInterval = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                const sum = dataArray.reduce((a, b) => a + b, 0);
                
                if (sum > 0) {
                    hasAudioData = true;
                }
                
                testCount++;
                
                if (testCount >= maxTests) {
                    clearInterval(testInterval);
                    audioContext.close();
                    
                    if (hasAudioData) {
                        console.log('✅ Audio stream test passed');
                        resolve({ success: true });
                    } else {
                        console.warn('⚠️ No audio data detected in stream');
                        resolve({ 
                            success: false, 
                            error: 'No audio signal detected. Please check your microphone and speak into it.' 
                        });
                    }
                }
            }, 50);
        });
        
    } catch (error) {
        console.error('❌ Audio stream test failed:', error);
        return { 
            success: false, 
            error: 'Failed to test audio stream. Your browser may not support Web Audio API.' 
        };
    }
}

export function getMicrophoneDevices(): Promise<MediaDeviceInfo[]> {
    return navigator.mediaDevices.enumerateDevices()
        .then(devices => devices.filter(device => device.kind === 'audioinput'))
        .catch(error => {
            console.error('Failed to enumerate microphone devices:', error);
            return [];
        });
}

export async function checkMicrophoneSupport(): Promise<{
    supported: boolean;
    features: {
        getUserMedia: boolean;
        mediaRecorder: boolean;
        webAudio: boolean;
        permissions: boolean;
    };
}> {
    const features = {
        getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
        mediaRecorder: typeof MediaRecorder !== 'undefined',
        webAudio: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
        permissions: 'permissions' in navigator
    };
    
    const supported = features.getUserMedia && features.mediaRecorder && features.webAudio;
    
    console.log('🔍 Browser audio support check:', features);
    
    return { supported, features };
}

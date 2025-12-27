// Audio processing service with chunking and retry logic
import { transcribeAudio, translateText } from './api';
import { combineTranscriptions } from './chunkedAudioRecorder';

export interface ProcessingResult {
    transcription: string;
    translation: string;
    actualTranslation?: string; // The actual translation to different language
    audioBlob?: Blob;
    chunks: string[];
}

export async function processChunkedAudio(
    audioChunks: Blob[],
    sourceLang: string,
    targetLang: string,
    tone: string,
    onProgress?: (progress: number, stage: string) => void
): Promise<ProcessingResult> {
    console.log(`🔄 Processing ${audioChunks.length} audio chunks...`);

    const transcriptions: string[] = [];
    let totalChunks = audioChunks.length;

    // Step 1: Transcribe all chunks
    onProgress?.(0, `Transcribing audio (0/${totalChunks} chunks)...`);

    for (let i = 0; i < audioChunks.length; i++) {
        const chunk = audioChunks[i];
        
        console.log(`📝 Transcribing chunk ${i + 1}/${totalChunks}`);
        onProgress?.(
            (i / totalChunks) * 50, 
            `Transcribing audio (${i + 1}/${totalChunks} chunks)...` 
        );

        try {
            const audioFile = new File(
                [chunk],
                `chunk-${i}.webm`,
                { type: 'audio/webm' }
            );

            const result = await transcribeWithRetry(audioFile, sourceLang);
            transcriptions.push(result.transcription);

        } catch (error) {
            console.error(`❌ Failed to transcribe chunk ${i + 1}:`, error);
            // Continue with other chunks even if one fails
            transcriptions.push(`[Transcription failed for segment ${i + 1}]`);
        }
    }

    // Combine transcriptions with smart joining
    const fullTranscription = combineTranscriptions(transcriptions);
    console.log(`✅ Full transcription: ${fullTranscription.substring(0, 100)}...`);

    // Step 2: Translate combined text
    onProgress?.(60, 'Translating text...');

    const translationResult = await translateText(
        fullTranscription,
        sourceLang,
        targetLang,
        tone
    );

    // Step 3: Synthesize speech (optional)
    onProgress?.(80, 'Generating speech...');

    let audioBlob: Blob | undefined;
    try {
        // Note: You'll need to implement synthesizeSpeech if not already available
        // For now, we'll skip this step
        console.log('🔊 Speech synthesis skipped - not implemented in current API');
    } catch (error) {
        console.warn('⚠️ Speech synthesis failed:', error);
    }

    onProgress?.(100, 'Complete!');

    return {
        transcription: fullTranscription,
        translation: translationResult.translation,
        audioBlob,
        chunks: transcriptions,
    };
}

export async function transcribeWithRetry(
    audioFile: File,
    language: string,
    maxRetries: number = 3
): Promise<{ transcription: string; language: string; confidence: number }> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Transcription attempt ${attempt}/${maxRetries}`);

            const result = await transcribeAudio(audioFile, language);
            console.log('✅ Transcription successful');
            return result;

        } catch (error) {
            lastError = error as Error;
            console.error(`❌ Attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                // Exponential backoff: 1s, 2s, 4s
                const delayMs = Math.pow(2, attempt - 1) * 1000;
                console.log(`⏳ Retrying in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
    }

    throw new Error(`Transcription failed after ${maxRetries} attempts: ${lastError?.message}`);
}

export async function compressAudio(audioBlob: Blob): Promise<Blob> {
    console.log(`🗜️ Compressing audio: ${audioBlob.size} bytes`);

    try {
        // Create audio context
        const audioContext = new AudioContext();

        // Decode audio data
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Downsample to 16kHz (optimal for speech recognition)
        const targetSampleRate = 16000;
        const offlineContext = new OfflineAudioContext(
            1, // Mono
            audioBuffer.duration * targetSampleRate,
            targetSampleRate
        );

        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();

        // Convert to WAV format (smaller for speech)
        const wavBlob = audioBufferToWav(renderedBuffer);

        const compressionRatio = ((1 - wavBlob.size / audioBlob.size) * 100).toFixed(1);
        console.log(`✅ Compressed: ${audioBlob.size} → ${wavBlob.size} bytes (${compressionRatio}% reduction)`);

        await audioContext.close();
        return wavBlob;

    } catch (error) {
        console.error('❌ Audio compression failed:', error);
        return audioBlob; // Return original if compression fails
    }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length * buffer.numberOfChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    let offset = 0;

    // Write WAV header
    setString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    setString(view, 8, 'WAVE');
    setString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2 * buffer.numberOfChannels, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    setString(view, 36, 'data');
    view.setUint32(40, length, true);

    // Write audio data
    const channelData = buffer.getChannelData(0);
    offset = 44;
    for (let i = 0; i < channelData.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function setString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
    }
}

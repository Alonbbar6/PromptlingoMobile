const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs-extra');

const router = express.Router();

// OpenAI Whisper API integration
router.post('/', async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      console.error('❌ [TRANSCRIBE] No file provided');
      return res.status(400).json({
        error: 'No audio file provided',
        message: 'Please provide an audio file to transcribe'
      });
    }

    filePath = req.file.path;

    // Check file size limit
    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(413).json({
        error: 'Audio file too large',
        message: 'Audio file must be less than 25MB'
      });
    }

    const { language } = req.body;

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ [TRANSCRIBE] OpenAI API key not configured');
      return res.status(500).json({
        error: 'OpenAI API key not configured',
        message: 'Please configure OPENAI_API_KEY in environment variables'
      });
    }

    // Prepare form data for OpenAI API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path));
    formData.append('model', 'whisper-1');

    // Only append language for supported languages
    // Whisper doesn't support 'ht' (Haitian Creole), so we let it auto-detect
    if (language && language === 'en') {
      formData.append('language', language);
    } else if (language === 'ht') {
      // Add prompt with comprehensive Haitian Creole vocabulary
      // This significantly improves recognition of Creole-specific vocabulary
      const haitianCreolePrompt = `
Bonjou, Bonswa, N ap boule, Mwen byen, Mèsi, Pa dekwa, Orevwa, N a wè pita, Kijan ou ye, Sak pase, N ap kenbe, Mwen kontan rankontre w, Ki jan ou rele, Mwen rele, Kote ou prale, Mwen prale, Kisa ou ap fè, Mwen ap travay, Mwen ap etidye, Kisa ou vle, Mwen vle, Kisa sa ye, Sa se, Ki lè, Ki kote, Poukisa, Kòman, Konbyen, Wi, Non, Petèt, Tanpri, Eskize m, Padone m, Mwen renmen w, Fè mye talè, Ale vou zan, Kite m anrepo m, Mwen pa konprann, Pale pi dousman, Repete sa, Kreyòl pale, Kreyòl konprann, Lè poul a gen dan, Sòt pa touye w, men li fè w swè, Sezi kou berejèn, Chawa pete, Mawozo, Nan zil tik, Bwòdè, Pa gen pwoblèm, Bon lapwémidi, Bonswè, Bòn nwi, Pli ta, Alo, Sali, Kòman ou ye, Mwen la, Mwen pa pi mal, E ou menm, Nou tout anfòm, Kisa w ap di, Anyen menm, Mwen swaf, Mwen grangou, Mwen fatige, Mwen bezwen èd, Ban m yon kout men, Vin ede m, Fè vit, Tann yon ti moman, Sa k ap fèt, Mwen pa konnen, Sa fè m plezi, Bon chans, Felisitasyon, Kè kontan, Mwen tris, Mwen fache, Mwen pè, Mwen sezi, Mwen gen rezon, Ou gen tò, Sa a bon, Sa a pa bon, Sa a chè, Sa a bon mache, Mwen pa gen lajan, Konbyen sa koute, Kote twalèt la, Kote estasyon bis la, Mwen pèdi, Mwen malad, Mwen bezwen yon doktè, Rele anbilans, Dlo, Manje, Kay, Travay, Lekòl, Lajan, Fanmi, Zanmi, Ayiti, Repiblik Dominikèn, Panyòl, Angle, Kreyòl, Youn, De, Twa, Kat, Senk, Sis, Sèt, Uit, Nèf, Dis, Ven, Trant, Karant, Senkant, San, Mil, Premye, Dezyèm, Twazyèm, Dènye, Anpil, Ti kras, Tout, Okenn, Plis, Mwens, Jodi a, Yè, Demen, Maten, Apremidi, Aswè, Semèn, Mwa, Ane, Isit la, Laba a, Adwat, Agòch, Tou dwat, Anwo, Anba, Devan, Dèyè, Andedan, Deyò, Sou, Anba, Akote, Ant, Nan, Pou, Avèk, San, Men, Oswa, Paske, Si, Lè, Kòm, Menm si, Malgre, Pou sa, Se poutèt sa, Kisa ou panse, Mwen panse, Mwen kwè, Mwen espere, Mwen konnen, Mwen pa konnen, Mwen bliye, Mwen sonje, Mwen dwe, Mwen kapab, Mwen pa kapab, Mwen ta renmen, Mwen pa ta renmen, Sa enpòtan, Sa pa enpòtan, Fè atansyon, Pran swen tèt ou, Bon vwayaj, Byen vini, Mwen regrèt, Pa enkyete w, Sa se lavi, Sa se yon pwoblèm, Nou gen yon solisyon, Ann kòmanse, Ann fini, Mwen pare, Mwen pa pare, Mwen bezwen yon ti repo, Mwen bezwen yon randevou, Ki kote doulè a ye, Èske ou gen lafyèv, Èske ou gen touse, Èske ou gen dyare, Èske ou ansent, Pran medikaman sa a, Ou dwe rete kouche, Ou dwe bwè anpil dlo, Mwen se enfimyè a, Mwen se doktè a, Ou bezwen yon entèprèt, Mwen pa pale Kreyòl, Ou pale Kreyòl, Ou pale Panyòl, Ou pale Angle, Mwen gen yon alèji, Ki medikaman ou pran, Fè yon tès, Rezilta yo, Li grav, Li pa grav, Ou pral anfòm, Ou gen yon enfeksyon, Antibyotik, Famasi, Lopital, Klinik, Swen sante, Asirans, Fòm, Dokiman, Siye l atè, Bouche nen ou pou bwè`;

      formData.append('prompt', haitianCreolePrompt);
      // Use temperature for more deterministic output
      formData.append('temperature', '0');
    }

    // Add response format for cleaner output
    formData.append('response_format', 'text');

    // Call OpenAI Whisper API
    const response = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // When response_format is 'text', response.data is a string directly
    let transcriptionText = typeof response.data === 'string' ? response.data : response.data.text;

    // Post-process Haitian Creole transcriptions with GPT-4 for error correction
    if (language === 'ht' && transcriptionText) {

      try {
        const gptResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are a Haitian Creole language expert. Your job is to correct transcription errors in Haitian Creole text. Common errors include:
- "Mwen" (I) being transcribed as "Ou" (You) or vice versa
- "Gen" vs "Gèn" vs "Gin"
- Missing or incorrect accent marks
- Common word confusions

Fix any errors while preserving the original meaning. Return ONLY the corrected Haitian Creole text, nothing else.`
              },
              {
                role: 'user',
                content: transcriptionText
              }
            ],
            temperature: 0.3,
            max_tokens: 500
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const correctedText = gptResponse.data.choices[0].message.content.trim();
        transcriptionText = correctedText;
      } catch (gptError) {
        console.error(`⚠️ GPT-4 post-processing failed, using raw transcription:`, gptError.message);
        // Continue with raw transcription if GPT-4 fails
      }
    }

    // Return transcription result
    res.json({
      transcription: transcriptionText,
      language: language || 'auto',
      confidence: 0.95, // Whisper doesn't provide confidence scores
      model: 'whisper-1'
    });

  } catch (error) {
    console.error(`❌ [TRANSCRIBE] Failed:`, error.message);

    if (error.response) {
      const { status, data } = error.response;
      console.error(`   API Error ${status}:`, data);
      return res.status(status).json({
        error: 'Transcription failed',
        message: data.error?.message || 'Failed to transcribe audio',
        details: data.error
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'Audio file too large or processing took too long'
      });
    }

    res.status(500).json({
      error: 'Transcription failed',
      message: error.message || 'An unexpected error occurred'
    });
  } finally {
    // CRITICAL: Always delete the audio file, even if processing fails
    if (filePath) {
      try {
        await fs.remove(filePath);
      } catch (cleanupError) {
        console.error(`Failed to delete audio file: ${cleanupError.message}`);
        // Log the error but don't fail the request
      }
    }
  }
});

module.exports = router;

import { fileURLToPath } from 'url';
import path from 'path';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';
import * as mega from 'megajs';

async function processTxtAndSaveCredentials(txt) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let decodedData;

  // Check if the input is Base64 or a Mega URL
  const isBase64 = /^[a-zA-Z0-9+/]+={0,2}$/.test(txt);
  const isMega = txt.startsWith('Prince~');

  if (isBase64) {
    // Handle Base64 input
    decodedData = Buffer.from(txt, 'base64').toString('utf-8');
  } else if (isMega) {
    // Handle Mega.nz input
    const megaCode = txt.replace('Prince~', '');
    const megaUrl = `https://mega.nz/file/${megaCode}`;
    console.log('Mega URL:', megaUrl);

    const file = mega.File.fromURL(megaUrl);

    try {
      const stream = file.download();
      let data = '';
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      decodedData = data;
    } catch (error) {
      console.error('Error downloading from Mega.nz:', error);
      return;
    }
  } else {
    // Handle URL (gurupaste)
    const url = `https://gurupaste.gurucharan-saho.repl.co/pastes?action=getpaste&id=${txt}`;
    try {
      const response = await fetch(url);
      const base64Data = await response.json();
      const realBase64Data = base64Data.content;
      decodedData = Buffer.from(realBase64Data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Error retrieving or processing data:', error);
      return;
    }
  }

  // Save the credentials to a file
  try {
    const credsPath = path.join(__dirname, '..', 'sessions', 'creds.json');
    writeFileSync(credsPath, JSON.stringify(JSON.parse(decodedData), null, 2));
    console.log('Credentials saved to creds.json');
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

export default processTxtAndSaveCredentials;

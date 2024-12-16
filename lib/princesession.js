import { fileURLToPath } from 'url';
import path from 'path';
import { writeFileSync } from 'fs';
import fetch from 'node-fetch';
import * as mega from 'megajs';

async function processTxtAndSaveCredentials(txt) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  let decodedData;

  // Check if the input is Base64, full Mega URL, or custom paste URL
  const isBase64 = /^[a-zA-Z0-9+/]+={0,2}$/.test(txt);
  const isMega = txt.startsWith('Prince~');
  const isMegaFullUrl = txt.startsWith('https://mega.nz/');

  if (isBase64) {
    // Handle Base64 input
    console.log('Processing Base64 credentials...');
    try {
      decodedData = Buffer.from(txt, 'base64').toString('utf-8');
    } catch (error) {
      console.error('Invalid Base64 input:', error);
      return;
    }
  } else if (isMegaFullUrl) {
    // Handle full Mega.nz URL
    console.log('Processing full Mega URL...');
    try {
      const file = mega.File.fromURL(txt);
      const stream = file.download();
      let data = '';
      for await (const chunk of stream) {
        data += chunk.toString();
      }
      decodedData = data;
    } catch (error) {
      console.error('Error downloading from Mega.nz (full URL):', error);
      return;
    }
  } else if (isMega) {
    // Handle incomplete Mega.nz input
    const megaCode = txt.replace('Prince~', '').trim();
    console.error(
      'Invalid Mega input: Missing decryption key. Please provide a full Mega.nz URL with the key.'
    );
    return;
  } else {
    // Handle GuruPaste URL
    const url = `https://gurupaste.gurucharan-saho.repl.co/pastes?action=getpaste&id=${txt}`;
    console.log('Processing GuruPaste URL:', url);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch paste: ${response.statusText}`);

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
    console.log('Credentials saved successfully to creds.json');
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

export default processTxtAndSaveCredentials;

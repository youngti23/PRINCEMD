import { promises } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

// Updated FFmpeg function with Heroku-compatible FFmpeg path
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      // Temporary file paths for input and output
      let tmp = join(global.__dirname(import.meta.url), '../tmp', +new Date() + '.' + ext);
      let out = tmp + '.' + ext2;

      // Write the input buffer to a temporary file
      await promises.writeFile(tmp, buffer);

      // Spawn FFmpeg process with arguments
      spawn('/app/.heroku/bin/ffmpeg', [ // Use Heroku-compatible FFmpeg path
        '-y',
        '-i', tmp,
        ...args,
        out,
      ])
        .on('error', (err) => {
          console.error('FFmpeg error:', err); // Log FFmpeg errors
          reject(err);
        })
        .on('close', async (code) => {
          try {
            // Clean up temporary input file
            await promises.unlink(tmp);

            // Handle non-zero exit codes
            if (code !== 0) {
              console.error('FFmpeg exited with code:', code);
              return reject(new Error('FFmpeg process failed'));
            }

            // Read the output file and return the result
            resolve({
              data: await promises.readFile(out),
              filename: out,
              delete() {
                return promises.unlink(out);
              },
            });
          } catch (e) {
            reject(e);
          }
        });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to WhatsApp-compatible Voice Note (PTT)
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', // Disable video
    '-c:a', 'libopus', // Use Opus codec
    '-b:a', '128k', // Set bitrate
    '-vbr', 'on', // Enable variable bitrate
  ], ext, 'ogg'); // Convert to OGG format
}

/**
 * Convert Audio to WhatsApp-compatible Audio
 * @param {Buffer} buffer - Audio buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn', // Disable video
    '-c:a', 'libopus', // Use Opus codec
    '-b:a', '128k', // Set bitrate
    '-vbr', 'on', // Enable variable bitrate
    '-compression_level', '10', // Set compression level
  ], ext, 'opus'); // Convert to Opus format
}

/**
 * Convert Video to WhatsApp-compatible Video
 * @param {Buffer} buffer - Video buffer
 * @param {String} ext - File extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264', // Use H.264 codec
    '-c:a', 'aac', // Use AAC audio codec
    '-ab', '128k', // Set audio bitrate
    '-ar', '44100', // Set audio sampling rate
    '-crf', '32', // Set quality
    '-preset', 'slow', // Set encoding speed/quality tradeoff
  ], ext, 'mp4'); // Convert to MP4 format
}

export {
  toAudio,
  toPTT,
  toVideo,
  ffmpeg,
};

import { execSync } from 'child_process';
import fs from 'fs';
import inquirer from 'inquirer';
import path from 'path';

const CONTENT_DIR = './content';
if (!fs.existsSync(CONTENT_DIR)) fs.mkdirSync(CONTENT_DIR);

async function main() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'Choose an option:',
            choices: ['Download from YouTube and Crop', 'Crop an Existing Video', 'Download Audio from YouTube','Download Video from YouTube', 'Close']
        }
    ]);

    if (action === 'Download from YouTube and Crop') {
        const { url, startTime, duration } = await inquirer.prompt([
            { type: 'input', name: 'url', message: 'Enter YouTube URL:' },
            { type: 'input', name: 'startTime', message: 'Enter start time (HH:MM:SS or seconds):' },
            { type: 'input', name: 'duration', message: 'Enter duration in seconds:' }
        ]);
        downloadAndCrop(url, startTime, duration);
    }else if(action === 'Download Video from YouTube'){
        const { url } = await inquirer.prompt([
            { type: 'input', name: 'url', message: 'Enter YouTube URL:' },
            
        ]);
        DownloadFullVideo(url);
    } else if (action === 'Crop an Existing Video') {
        const files = fs.readdirSync(CONTENT_DIR).filter(file => {
            return ['.mp4', '.mkv', '.webm', '.avi', '.mov', '.flv', '.mpeg'].some(ext => file.endsWith(ext));
        });
    
        if (files.length === 0) {
            console.log('No video files found in the content folder.');
            return;
        }
    
        const { file, startTime, duration } = await inquirer.prompt([
            { type: 'list', name: 'file', message: 'Select a video:', choices: files },
            { type: 'input', name: 'startTime', message: 'Enter start time (HH:MM:SS or seconds):' },
            { type: 'input', name: 'duration', message: 'Enter duration in seconds:' }
        ]);
    
        cropVideo(path.join(CONTENT_DIR, file), startTime, duration);
    } else if(action === 'Close'){
        return
    }
     else {
        const { url } = await inquirer.prompt([
            { type: 'input', name: 'url', message: 'Enter YouTube URL:' }
        ]);
        downloadAudio(url);
    }
}

function downloadAndCrop(url, startTime, duration) {
    console.log('Downloading video...');
    const downloadCommand = `yt-dlp -f "bestvideo+bestaudio/best" -o "${CONTENT_DIR}/downloaded.%(ext)s" ${url}`;
    execSync(downloadCommand, { stdio: 'inherit' });
    const files = fs.readdirSync(CONTENT_DIR);
    const downloadedFile = files.find(file => file.startsWith('downloaded.'));
    if (!downloadedFile) {
        throw new Error('Downloaded file not found!');
    }
    const downloadFilePath = path.join(CONTENT_DIR, downloadedFile);
    const fileExtension = path.extname(downloadedFile);
    console.log('Fixing metadata...');
    const fixedFilePath = path.join(CONTENT_DIR, `fixed_downloaded${fileExtension}`);
    execSync(`ffmpeg -i "${downloadFilePath}" -c copy -map 0 -movflags +faststart "${fixedFilePath}"`, { stdio: 'inherit' });
    fs.renameSync(fixedFilePath, downloadFilePath);
    cropVideo(downloadFilePath, startTime, duration);
    console.clear()
    main();
}

function DownloadFullVideo(url) {
    console.log('Downloading video...');
    const downloadCommand = `yt-dlp -f "bestvideo+bestaudio/best" -o "${CONTENT_DIR}/downloaded.%(ext)s" ${url}`;
    execSync(downloadCommand, { stdio: 'inherit' });
    const files = fs.readdirSync(CONTENT_DIR);
    const downloadedFile = files.find(file => file.startsWith('downloaded.'));
    
    if (!downloadedFile) {
        throw new Error('Downloaded file not found!');
    }

    const downloadFilePath = path.join(CONTENT_DIR, downloadedFile);
    const fileExtension = path.extname(downloadedFile);

    console.log('Fixing metadata...');
    const fixedFilePath = path.join(CONTENT_DIR, `fixed_downloaded${fileExtension}`);
    execSync(`ffmpeg -i "${downloadFilePath}" -c copy -map 0 -movflags +faststart "${fixedFilePath}"`, { stdio: 'inherit' });
    fs.renameSync(fixedFilePath, downloadFilePath);
    console.clear()
    main();
}

function cropVideo(filePath, startTime, duration) {
    const outputPath = getNextClipName();
    const startSeconds = timeToSeconds(startTime);
    let durationSeconds = parseInt(duration, 10);

    if (duration.includes(':')) {
        const endSeconds = timeToSeconds(duration);
        durationSeconds = endSeconds - startSeconds;
    }

    console.log(`Cropping from ${startTime} for ${durationSeconds} seconds...`);
    execSync(`ffmpeg -i "${filePath}" -ss ${startTime} -t ${durationSeconds} -c:v copy -c:a copy "${outputPath}"`, { stdio: 'inherit' });
    console.log(`Cropped video saved as ${outputPath}`);
    console.clear()
    main();
}

function downloadAudio(url) {
    console.log('Downloading audio...');
    execSync(`yt-dlp -f "bestaudio" -x --audio-format mp3 -o "${CONTENT_DIR}/%(title)s.%(ext)s" ${url}`, { stdio: 'inherit' });
    console.log('Audio downloaded successfully.');
    console.clear()
    main();
}

function getNextClipName() {
    let index = 1;
    let outputPath;
    do {
        outputPath = path.join(CONTENT_DIR, `clip_${index}.mp4`);
        index++;
    } while (fs.existsSync(outputPath));
    return outputPath;
}

function timeToSeconds(time) {
    const parts = time.split(':').map(Number);
    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else {
        return parseInt(time, 10);
    }
}
main();

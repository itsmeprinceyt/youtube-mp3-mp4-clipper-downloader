# YouTube Video Downloader and Editor

This script allows you to download videos and audio from YouTube, crop existing videos, and extract specific segments. It utilizes `yt-dlp` for downloading and `ffmpeg` for processing.

## Requirements

Before running the script, ensure you have the following installed:

- **Node.js** (latest LTS recommended) - [Download](https://nodejs.org/)
- **yt-dlp** - [Installation Guide](https://github.com/yt-dlp/yt-dlp)
- **ffmpeg** - [Installation Guide](https://ffmpeg.org/download.html)

## Installation
1. Clone the repository or download the script.
2. Navigate to the project folder:
```bash
cd your_project_directory
```
3. Install dependencies:
```bash
npm install
```
## Usage
Run the script using:
```bash
npm start
```

## You will be presented with options:

1. **Download from YouTube and Crop** - Downloads a video from YouTube and extracts a segment.
2. **Crop an Existing Video** - Allows cropping of a video stored in the content/ folder.
3. **Download Video from YouTube** - Downloads a full YouTube video in the best quality.
4. **Download Audio from YouTube** - Extracts and saves only the audio from a YouTube video.
5. **Close** - Exits the script.

## Notes

• The downloaded videos and cropped clips are stored in the content/ directory.

•Ensure that yt-dlp and ffmpeg are properly installed and available in your system’s PATH.

•If you encounter permission errors, try running the script with sudo (Linux/macOS).
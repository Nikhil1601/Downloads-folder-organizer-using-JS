const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const util = require('util');

const mkdirAsync = util.promisify(fs.mkdir);
const readdirAsync = util.promisify(fs.readdir);

async function getDownloadsFolder() {
    const homeDirectory = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH;
    return path.join(homeDirectory, 'Downloads');
}

async function organizeDownloads() {
    try {
        const downloadsFolder = await getDownloadsFolder();
        const compressedFolder = path.join(downloadsFolder, 'compressed');
        const documentsFolder = path.join(downloadsFolder, 'documents');
        const audioFolder = path.join(downloadsFolder, 'audio');
        const videoFolder = path.join(downloadsFolder, 'video');

        await mkdirAsync(compressedFolder, { recursive: true });
        await mkdirAsync(documentsFolder, { recursive: true });
        await mkdirAsync(audioFolder, { recursive: true });
        await mkdirAsync(videoFolder, { recursive: true });

        const files = await readdirAsync(downloadsFolder);
        for (const file of files) {
            const filePath = path.join(downloadsFolder, file);
            const extension = path.extname(file).toLowerCase();

            if (['.zip', '.7z', '.rar'].includes(extension)) {
                await copyFile(filePath, path.join(compressedFolder, file));
            } else if (['.pdf', '.xlsx'].includes(extension)) {
                await copyFile(filePath, path.join(documentsFolder, file));
            } else if (['.mp4', '.mkv'].includes(extension)) {
                await copyFile(filePath, path.join(videoFolder, file));
            } else if (['.mp3', '.wav'].includes(extension)) {
                await copyFile(filePath, path.join(audioFolder, file));
            }
        }

        console.log('Files organized successfully!');
    } catch (error) {
        console.error('Error organizing files:', error.message);
    }
}

async function copyFile(source, destination) {
    const sourceStream = fs.createReadStream(source);
    const destinationStream = fs.createWriteStream(destination);

    return new Promise((resolve, reject) => {
        pipeline(sourceStream, destinationStream, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

organizeDownloads();

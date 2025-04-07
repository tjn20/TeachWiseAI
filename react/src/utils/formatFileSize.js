const FORMAT_FILE_SIZE = (fileSizeInBytes) => {
    if (fileSizeInBytes < 1024) {
        return `${fileSizeInBytes}B`; // Bytes
    } else if (fileSizeInBytes < 1024 ** 2) {
        return `${(fileSizeInBytes / 1024).toFixed(2)} KB`; // Kilobytes
    } else if (fileSizeInBytes < 1024 ** 3) {
        return `${(fileSizeInBytes / (1024 ** 2)).toFixed(2)} MB`; // Megabytes
    } else {
        return `${(fileSizeInBytes / (1024 ** 3)).toFixed(2)} GB`; // Gigabytes
    }
}

export default FORMAT_FILE_SIZE
const crypto = require('crypto');

class BunnyTokenSigner {
    constructor(securityKey, libraryId) {
        this.securityKey = securityKey;
        this.libraryId = libraryId;
    }

    /**
     * Generate signed URL for HLS video streaming
     * @param {string} videoId - Bunny.net video ID
     * @param {number} expiresInSeconds - Token expiry time in seconds (default: 1 hour)
     * @param {string} userIp - Optional: Lock token to specific IP
     * @returns {string} Signed URL
     */
    generateSignedUrl(videoId, expiresInSeconds = 3600, userIp = null) {
        const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
        
        // Path structure for HLS streaming
        const path = `/${this.libraryId}/${videoId}/playlist.m3u8`;
        
        // Build signing data
        let signingData = `token_path=${encodeURIComponent(path)}&expires=${expires}`;
        
        // Add IP if provided (IP locking)
        if (userIp) {
            signingData = `${signingData}&token_ip=${userIp}`;
        }
        
        // Generate HMAC-SHA256 signature
        const signature = crypto
            .createHmac('sha256', this.securityKey)
            .update(signingData)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        const token = `HS256-${signature}`;
        
        // Build signed URL for HLS streaming (path-based token for HLS support)
        const cdnHost = process.env.BUNNY_CDN_HOSTNAME || 'video.bunnycdn.com';
        const signedUrl = `https://${cdnHost}/${this.libraryId}/${videoId}/playlist.m3u8?token=${token}&expires=${expires}&token_path=${encodeURIComponent(path)}`;
        
        return signedUrl;
    }

    /**
     * Generate signed URL for thumbnail/image
     */
    generateSignedThumbnailUrl(videoId, expiresInSeconds = 3600) {
        const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
        const path = `/${this.libraryId}/${videoId}/thumbnail.jpg`;
        
        const signingData = `expires=${expires}`;
        const signature = crypto
            .createHmac('sha256', this.securityKey)
            .update(signingData)
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        const token = `HS256-${signature}`;
        const cdnHost = process.env.BUNNY_CDN_HOSTNAME || 'video.bunnycdn.com';
        
        return `https://${cdnHost}/${this.libraryId}/${videoId}/thumbnail.jpg?token=${token}&expires=${expires}`;
    }
}

module.exports = BunnyTokenSigner;
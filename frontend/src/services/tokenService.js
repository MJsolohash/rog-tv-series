// src/services/tokenService.js
import CryptoJS from 'crypto-js';

const SECURITY_KEY = "5bbd00a4-b88b-4450-a5ac-db5f6d93d275";
const BASE_URL = "https://newtoken.b-cdn.net";

/**
 * Generate signed URL for Bunny CDN video
 * @param {string} videoPath - Path like /backgrounds/video.mp4
 * @returns {string} Signed URL with token
 */
export const generateSignedUrl = (videoPath) => {
    const expires = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
    
    // Bunny CDN SHA256 hash: SecurityKey + VideoPath + Expires
    const stringToHash = SECURITY_KEY + videoPath + expires;
    const hash = CryptoJS.SHA256(stringToHash);
    const token = hash.toString(CryptoJS.enc.Base64)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    
    return `${BASE_URL}${videoPath}?token=${token}&expires=${expires}`;
};

/**
 * Extract path from full Bunny CDN URL
 * @param {string} url - Full URL or path
 * @returns {string} Path like /backgrounds/video.mp4
 */
export const extractPathFromUrl = (url) => {
    if (!url) return '';
    
    try {
        const urlObj = new URL(url);
        return urlObj.pathname;
    } catch {
        // Full URL නොවෙන්නේ නම්
        const match = url.match(/\.b-cdn\.net(\/[^?]*)/);
        if (match) return match[1];
        
        // දැනටමත් path එකක් නම්
        return url.startsWith('/') ? url : `/${url}`;
    }
};

/**
 * Generate signed URL from full URL (extract path first)
 * @param {string} fullUrl - Full Bunny CDN URL
 * @returns {string} New signed URL
 */
export const resignUrl = (fullUrl) => {
    const path = extractPathFromUrl(fullUrl);
    return generateSignedUrl(path);
};
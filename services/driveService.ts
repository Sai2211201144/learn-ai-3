import * as storageService from './storageService';

// This Client ID is provided by the user.
// In a production app, this should be stored in an environment variable.
const CLIENT_ID = '38960910449-965v8702f2km3me28nvk63mpftabkaj6.apps.googleusercontent.com';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const BACKUP_FILE_NAME = 'learnai_backup.json';

declare const gapi: any;
declare const google: any;

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

const initGapiClient = () => {
    return new Promise<void>((resolve, reject) => {
        gapi.load('client', async () => {
            try {
                await gapi.client.init({
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    });
};

const initGisClient = () => {
    return new Promise<void>((resolve, reject) => {
        try {
            if (typeof google === 'undefined' || !google.accounts?.oauth2?.initTokenClient) {
                reject(new Error('Google Identity Services not loaded'));
                return;
            }
            
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // The callback is handled by the promise
            });
            gisInited = true;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

export const initClients = async () => {
    try {
        // Wait for the global gapi and google objects to be available
        await new Promise<void>((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 10 seconds timeout
            
            const interval = setInterval(() => {
                attempts++;
                if (typeof gapi?.load === 'function' && typeof google?.accounts?.oauth2?.initTokenClient === 'function') {
                    clearInterval(interval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    reject(new Error('Google APIs failed to load within timeout'));
                }
            }, 100);
        });
        
        await Promise.all([
            initGapiClient(),
            initGisClient()
        ]);
    } catch (error) {
        console.warn('Google Drive integration not available:', error);
        // Don't throw - just log the warning
    }
};

export const handleAuthClick = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        if (!gisInited || !gapiInited) {
            reject(new Error("Google API clients not initialized."));
            return;
        }

        tokenClient.callback = (resp: any) => {
            if (resp.error !== undefined) {
                reject(new Error(`Authentication error: ${resp.error.details || 'User cancelled or an error occurred.'}`));
            }
            resolve(resp);
        };

        if (gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

export const backupDataToDrive = async () => {
    if (!gapi.client.getToken()) {
        throw new Error("Authentication token is missing.");
    }

    const backupData = storageService.getAllDataForBackup();
    const fileContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' });
    
    // 1. Search for the file to get its ID
    let fileId: string | null = null;
    try {
        const response = await gapi.client.drive.files.list({
            q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
            spaces: 'drive',
            fields: 'files(id, name)',
        });
        if (response.result.files && response.result.files.length > 0) {
            fileId = response.result.files[0].id;
        }
    } catch (error) {
        throw new Error("Could not search for backup file on Google Drive.");
    }

    const metadata = {
        name: BACKUP_FILE_NAME,
        mimeType: 'application/json',
    };

    const formData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', blob);

    let uploadUrl: string;
    let method: 'POST' | 'PATCH';

    if (fileId) {
        // Use PATCH to update the existing file's content
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
    } else {
        // Use POST to create a new file
        uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        method = 'POST';
    }

    const res = await fetch(uploadUrl, {
        method,
        headers: new Headers({ 'Authorization': `Bearer ${gapi.client.getToken().access_token}` }),
        body: formData,
    });
    
    if (!res.ok) {
        const errorResponse = await res.json();
        console.error("Google Drive API upload error:", errorResponse);
        throw new Error(`Failed to upload to Google Drive: ${errorResponse.error.message}`);
    }

    return await res.json();
};

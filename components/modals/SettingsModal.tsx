
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Theme, allThemes } from '../../styles/themes';
import { CloseIcon, Cog6ToothIcon, LoadingSpinnerIcon, CheckCircleIcon, XCircleIcon } from '../common/Icons';
import * as driveService from '../../services/driveService';
import * as storageService from '../../services/storageService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type BackupStatus = 'idle' | 'initializing' | 'authenticating' | 'backing up' | 'success' | 'error';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const [backupStatus, setBackupStatus] = useState<BackupStatus>('idle');
    const [backupMessage, setBackupMessage] = useState('');
    const importInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setBackupStatus('initializing');
            setBackupMessage('');
            driveService.initClients()
                .then(() => setBackupStatus('idle'))
                .catch(err => {
                    console.error("Failed to initialize Google clients", err);
                    setBackupStatus('error');
                    setBackupMessage('Could not initialize Google Drive client.');
                });
        }
    }, [isOpen]);

    const handleBackup = async () => {
        setBackupStatus('authenticating');
        setBackupMessage('');
        try {
            await driveService.handleAuthClick();
            setBackupStatus('backing up');
            await driveService.backupDataToDrive();
            setBackupStatus('success');
            setBackupMessage('Your data has been successfully backed up to Google Drive as "learnai_backup.json".');
            setTimeout(() => {
                setBackupStatus(prevStatus => prevStatus === 'success' ? 'idle' : prevStatus);
            }, 5000);
        } catch (error: any) {
            console.error("Backup failed", error);
            setBackupStatus('error');
            setBackupMessage(error.message || "An unknown error occurred during backup.");
        }
    };
    
    const handleExport = () => {
        const data = storageService.getAllDataForBackup();
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "learnai_backup.json";
        link.click();
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
                if (window.confirm("Are you sure you want to import this data? This will overwrite all your current progress.")) {
                    try {
                        storageService.importData(text);
                        alert("Import successful! The application will now reload.");
                        window.location.reload();
                    } catch (error) {
                        alert(`Import failed: ${error instanceof Error ? error.message : 'Invalid file format.'}`);
                    }
                }
            }
        };
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    };

    const handleReset = () => {
        if (window.confirm("DANGER: Are you absolutely sure you want to reset the application? All your courses and progress will be permanently deleted.")) {
            storageService.resetApplication();
            alert("Application has been reset. Reloading now.");
            window.location.reload();
        }
    };

    const getBackupButtonContent = () => {
        switch (backupStatus) {
            case 'initializing': return <><LoadingSpinnerIcon className="w-5 h-5" /> Initializing...</>;
            case 'authenticating': return <><LoadingSpinnerIcon className="w-5 h-5" /> Authenticating...</>;
            case 'backing up': return <><LoadingSpinnerIcon className="w-5 h-5" /> Backing up...</>;
            case 'success': return <><CheckCircleIcon className="w-5 h-5" /> Success!</>;
            case 'error': return <><XCircleIcon className="w-5 h-5" /> Error</>;
            default: return 'Backup to Google Drive';
        }
    };

    if (!isOpen) return null;

    return (
         <div 
            className="fixed inset-0 bg-[var(--color-background)]/50 backdrop-blur-md flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
             <div
                className="bg-[var(--color-card)] rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-[var(--color-border)] flex flex-col max-h-[90vh] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Cog6ToothIcon className="w-8 h-8 text-[var(--color-primary)]" />
                        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-4">
                    <div className="space-y-8">
                        {/* Theme Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Theme</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {allThemes.map(t => (
                                    <button 
                                        key={t.name}
                                        onClick={() => setTheme(t.name)}
                                        className={`p-3 rounded-lg border-2 transition-all ${theme.name === t.name ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`}
                                    >
                                        <div className="w-full h-8 rounded mb-2" style={{ background: t.properties['--gradient-primary-accent'] }}></div>
                                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{t.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Management Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Data Management</h3>
                            <div className="bg-[var(--color-secondary)] p-4 rounded-lg space-y-3">
                                <button onClick={handleExport} className="w-full px-5 py-2.5 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/50">Export Data</button>
                                <input type="file" ref={importInputRef} onChange={handleImport} accept=".json" className="hidden"/>
                                <button onClick={() => importInputRef.current?.click()} className="w-full px-5 py-2.5 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-bold rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)]/50">Import Data</button>
                                <button
                                    onClick={handleBackup}
                                    disabled={backupStatus !== 'idle'}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 disabled:bg-gray-400/50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {getBackupButtonContent()}
                                </button>
                                {backupMessage && <p className={`text-xs text-center mt-2 ${backupStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>{backupMessage}</p>}
                            </div>
                        </div>
                        
                        {/* Danger Zone */}
                        <div>
                            <h3 className="text-xl font-semibold text-red-500 mb-3">Danger Zone</h3>
                             <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                <button onClick={handleReset} className="w-full px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">Reset Application</button>
                                <p className="text-xs text-center text-red-400 mt-2">Permanently delete all your local courses and progress.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
import {
    STORAGE_KEYS,
    DEFAULT_PROFILE_PAYLOAD,
    DEFAULT_CONSENT_PAYLOAD,
    DEFAULT_OPTIMIZED_PROFILE_PAYLOAD,
    DEFAULT_OPTIMIZED_CONSENT_PAYLOAD
} from './constants.js';

class StorageManager {
    constructor() {
        this.available = this.checkAvailability();
    }

    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    save(key, value) {
        if (!this.available) return false;
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Failed to save to localStorage:', e);
            return false;
        }
    }

    load(key, defaultValue) {
        if (!this.available) return defaultValue;
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage:', e);
            return defaultValue;
        }
    }

    clear() {
        if (!this.available) return;
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    getDefaultGrowthDate() {
        const date = new Date();
        date.setMonth(date.getMonth() + 6);
        return date.toISOString().split('T')[0];
    }

    loadAllSettings() {
        return {
            profileJson: this.load(STORAGE_KEYS.profileJson, JSON.stringify(DEFAULT_PROFILE_PAYLOAD, null, 2)),
            consentJson: this.load(STORAGE_KEYS.consentJson, JSON.stringify(DEFAULT_CONSENT_PAYLOAD, null, 2)),
            optimizedProfileJson: this.load(STORAGE_KEYS.optimizedProfileJson, JSON.stringify(DEFAULT_OPTIMIZED_PROFILE_PAYLOAD, null, 2)),
            optimizedConsentJson: this.load(STORAGE_KEYS.optimizedConsentJson, JSON.stringify(DEFAULT_OPTIMIZED_CONSENT_PAYLOAD, null, 2)),
            useOptimized: this.load(STORAGE_KEYS.useOptimized, false),
            compressionType: this.load(STORAGE_KEYS.compressionType, 'bzip2'),
            recordsMillions: this.load(STORAGE_KEYS.recordsMillions, 150),
            bandwidthLimitTb: this.load(STORAGE_KEYS.bandwidthLimitTb, 2),
            profileChangeRate: this.load(STORAGE_KEYS.profileChangeRate, 15),
            consentChangeRate: this.load(STORAGE_KEYS.consentChangeRate, 15),
            growthDate: this.load(STORAGE_KEYS.growthDate, this.getDefaultGrowthDate()),
            growthMultiplier: this.load(STORAGE_KEYS.growthMultiplier, 1.5),
            uiState: this.load(STORAGE_KEYS.uiState, {
                profileExpanded: false,
                consentExpanded: false,
                optimizedProfileExpanded: false,
                optimizedConsentExpanded: false
            })
        };
    }

    saveAllSettings(settings) {
        this.save(STORAGE_KEYS.profileJson, settings.profileJson);
        this.save(STORAGE_KEYS.consentJson, settings.consentJson);
        this.save(STORAGE_KEYS.optimizedProfileJson, settings.optimizedProfileJson);
        this.save(STORAGE_KEYS.optimizedConsentJson, settings.optimizedConsentJson);
        this.save(STORAGE_KEYS.useOptimized, settings.useOptimized);
        this.save(STORAGE_KEYS.compressionType, settings.compressionType);
        this.save(STORAGE_KEYS.recordsMillions, settings.recordsMillions);
        this.save(STORAGE_KEYS.bandwidthLimitTb, settings.bandwidthLimitTb);
        this.save(STORAGE_KEYS.profileChangeRate, settings.profileChangeRate);
        this.save(STORAGE_KEYS.consentChangeRate, settings.consentChangeRate);
        this.save(STORAGE_KEYS.growthDate, settings.growthDate);
        this.save(STORAGE_KEYS.growthMultiplier, settings.growthMultiplier);
        this.save(STORAGE_KEYS.uiState, settings.uiState);
    }
}

export const storage = new StorageManager();

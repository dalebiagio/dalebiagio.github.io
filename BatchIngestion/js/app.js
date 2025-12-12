import { storage } from './storage.js';
import { calculator } from './calculator.js';
import { chartManager } from './chart.js';
import {
    STORAGE_KEYS,
    DEFAULT_PROFILE_PAYLOAD,
    DEFAULT_CONSENT_PAYLOAD,
    DEFAULT_OPTIMIZED_PROFILE_PAYLOAD,
    DEFAULT_OPTIMIZED_CONSENT_PAYLOAD
} from './constants.js';
import { formatNumber, formatBytes, formatPercent, formatDays, formatDate, formatCompactNumber } from './formatters.js';
import { generateProfilePayload, generateConsentPayload, generateOptimizedProfilePayload, generateOptimizedConsentPayload } from './payloadGenerator.js';

class App {
    constructor() {
        this.saveTimeout = null;
        this.elements = {};
    }

    init() {
        this.cacheElements();
        this.loadSettings();
        this.setupEventListeners();
        this.updatePreviews();
        this.loadSchemas();
        chartManager.init('usageChart');
        this.calculate();

        // Show warning if localStorage unavailable
        if (!storage.available) {
            this.elements.warningBanner.classList.remove('hidden');
        }
    }

    async loadSchemas() {
        try {
            // Load profile schema
            const profileResponse = await fetch('input/schema/profile.json');
            const profileSchema = await profileResponse.json();
            this.elements.profileSchemaDisplay.textContent = JSON.stringify(profileSchema, null, 2);

            // Load consent schema
            const consentResponse = await fetch('input/schema/consent.json');
            const consentSchema = await consentResponse.json();
            this.elements.consentSchemaDisplay.textContent = JSON.stringify(consentSchema, null, 2);
        } catch (error) {
            console.error('Failed to load schemas:', error);
            this.elements.profileSchemaDisplay.textContent = 'Failed to load schema';
            this.elements.consentSchemaDisplay.textContent = 'Failed to load schema';
        }
    }

    cacheElements() {
        this.elements = {
            // Original Payload
            profilePayload: document.getElementById('profilePayload'),
            consentPayload: document.getElementById('consentPayload'),
            profilePanel: document.getElementById('profilePanel'),
            consentPanel: document.getElementById('consentPanel'),
            profilePreview: document.getElementById('profilePreview'),
            consentPreview: document.getElementById('consentPreview'),
            profileByteCount: document.getElementById('profileByteCount'),
            consentByteCount: document.getElementById('consentByteCount'),
            profileError: document.getElementById('profileError'),
            consentError: document.getElementById('consentError'),
            profileToggle: document.getElementById('profileToggle'),
            consentToggle: document.getElementById('consentToggle'),

            // Optimized Payload
            optimizedProfilePayload: document.getElementById('optimizedProfilePayload'),
            optimizedConsentPayload: document.getElementById('optimizedConsentPayload'),
            optimizedProfilePanel: document.getElementById('optimizedProfilePanel'),
            optimizedConsentPanel: document.getElementById('optimizedConsentPanel'),
            optimizedProfilePreview: document.getElementById('optimizedProfilePreview'),
            optimizedConsentPreview: document.getElementById('optimizedConsentPreview'),
            optimizedProfileByteCount: document.getElementById('optimizedProfileByteCount'),
            optimizedConsentByteCount: document.getElementById('optimizedConsentByteCount'),
            optimizedProfileSavings: document.getElementById('optimizedProfileSavings'),
            optimizedConsentSavings: document.getElementById('optimizedConsentSavings'),
            optimizedProfileError: document.getElementById('optimizedProfileError'),
            optimizedConsentError: document.getElementById('optimizedConsentError'),
            optimizedProfileToggle: document.getElementById('optimizedProfileToggle'),
            optimizedConsentToggle: document.getElementById('optimizedConsentToggle'),
            useOptimized: document.getElementById('useOptimized'),

            // Config
            compressionType: document.getElementById('compressionType'),
            recordsToHydrate: document.getElementById('recordsToHydrate'),
            bandwidthLimit: document.getElementById('bandwidthLimit'),
            profileChangeRate: document.getElementById('profileChangeRate'),
            profileChangeSlider: document.getElementById('profileChangeSlider'),
            consentChangeRate: document.getElementById('consentChangeRate'),
            consentChangeSlider: document.getElementById('consentChangeSlider'),

            // Growth
            growthDate: document.getElementById('growthDate'),
            growthMultiplier: document.getElementById('growthMultiplier'),
            growthDateWarning: document.getElementById('growthDateWarning'),
            growthMultiplierInfo: document.getElementById('growthMultiplierInfo'),

            // Results
            hydrationRecords: document.getElementById('hydrationRecords'),
            hydrationSize: document.getElementById('hydrationSize'),
            hydrationPercent: document.getElementById('hydrationPercent'),
            hydrationRemaining: document.getElementById('hydrationRemaining'),
            dailyProfileRecords: document.getElementById('dailyProfileRecords'),
            dailyConsentRecords: document.getElementById('dailyConsentRecords'),
            dailyTotalRecords: document.getElementById('dailyTotalRecords'),
            dailySize: document.getElementById('dailySize'),
            monthlySize: document.getElementById('monthlySize'),
            forecastDays: document.getElementById('forecastDays'),
            forecastMonths: document.getElementById('forecastMonths'),
            forecastSustainable: document.getElementById('forecastSustainable'),
            forecastUsage: document.getElementById('forecastUsage'),
            budgetCard: document.getElementById('budgetCard'),

            // Growth projection results
            growthProfileCurrent: document.getElementById('growthProfileCurrent'),
            growthProfileAfter: document.getElementById('growthProfileAfter'),
            growthConsentCurrent: document.getElementById('growthConsentCurrent'),
            growthConsentAfter: document.getElementById('growthConsentAfter'),
            growthCombinedCurrent: document.getElementById('growthCombinedCurrent'),
            growthCombinedAfter: document.getElementById('growthCombinedAfter'),
            growthDailyCurrent: document.getElementById('growthDailyCurrent'),
            growthDailyAfter: document.getElementById('growthDailyAfter'),
            growthDaysAtCurrent: document.getElementById('growthDaysAtCurrent'),
            growthDaysAtGrown: document.getElementById('growthDaysAtGrown'),
            growthTotalDays: document.getElementById('growthTotalDays'),
            growthProjectedUsage: document.getElementById('growthProjectedUsage'),
            growthDateDisplay: document.getElementById('growthDateDisplay'),
            growthMultiplierDisplay: document.getElementById('growthMultiplierDisplay'),

            // UI
            warningBanner: document.getElementById('warningBanner'),
            saveIndicator: document.getElementById('saveIndicator'),

            // Schemas
            schemasToggle: document.getElementById('schemasToggle'),
            schemasToggleIcon: document.getElementById('schemasToggleIcon'),
            schemasContent: document.getElementById('schemasContent'),
            profileSchemaDisplay: document.getElementById('profileSchemaDisplay'),
            consentSchemaDisplay: document.getElementById('consentSchemaDisplay'),

            // Payload Generator
            wirelessCount: document.getElementById('wirelessCount'),
            wirelineCount: document.getElementById('wirelineCount'),
            generatePayloadsBtn: document.getElementById('generatePayloadsBtn')
        };
    }

    loadSettings() {
        const settings = storage.loadAllSettings();

        // Original payloads
        this.elements.profilePayload.value = settings.profileJson;
        this.elements.consentPayload.value = settings.consentJson;

        // Optimized payloads
        this.elements.optimizedProfilePayload.value = settings.optimizedProfileJson;
        this.elements.optimizedConsentPayload.value = settings.optimizedConsentJson;
        this.elements.useOptimized.checked = settings.useOptimized;

        // Config
        this.elements.compressionType.value = settings.compressionType;
        this.elements.recordsToHydrate.value = settings.recordsMillions;
        this.elements.bandwidthLimit.value = settings.bandwidthLimitTb;
        this.elements.profileChangeRate.value = settings.profileChangeRate;
        this.elements.profileChangeSlider.value = settings.profileChangeRate;
        this.elements.consentChangeRate.value = settings.consentChangeRate;
        this.elements.consentChangeSlider.value = settings.consentChangeRate;
        this.elements.growthDate.value = settings.growthDate;
        this.elements.growthMultiplier.value = settings.growthMultiplier;

        // UI state
        if (settings.uiState.profileExpanded) {
            this.elements.profilePanel.classList.add('expanded');
        }
        if (settings.uiState.consentExpanded) {
            this.elements.consentPanel.classList.add('expanded');
        }
        if (settings.uiState.optimizedProfileExpanded) {
            this.elements.optimizedProfilePanel.classList.add('expanded');
        }
        if (settings.uiState.optimizedConsentExpanded) {
            this.elements.optimizedConsentPanel.classList.add('expanded');
        }
    }

    setupEventListeners() {
        // Original payload textareas
        this.elements.profilePayload.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.profileJson, this.elements.profilePayload.value);
            this.calculate();
        });

        this.elements.consentPayload.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.consentJson, this.elements.consentPayload.value);
            this.calculate();
        });

        // Optimized payload textareas
        this.elements.optimizedProfilePayload.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.optimizedProfileJson, this.elements.optimizedProfilePayload.value);
            this.calculate();
        });

        this.elements.optimizedConsentPayload.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.optimizedConsentJson, this.elements.optimizedConsentPayload.value);
            this.calculate();
        });

        // Use optimized toggle
        this.elements.useOptimized.addEventListener('change', () => {
            storage.save(STORAGE_KEYS.useOptimized, this.elements.useOptimized.checked);
            this.showSaveIndicator();
            this.calculate();
        });

        // Payload toggles
        this.elements.profileToggle.addEventListener('click', () => this.togglePayload('profile'));
        this.elements.consentToggle.addEventListener('click', () => this.togglePayload('consent'));
        this.elements.optimizedProfileToggle.addEventListener('click', () => this.togglePayload('optimizedProfile'));
        this.elements.optimizedConsentToggle.addEventListener('click', () => this.togglePayload('optimizedConsent'));

        // Compression
        this.elements.compressionType.addEventListener('change', () => {
            storage.save(STORAGE_KEYS.compressionType, this.elements.compressionType.value);
            this.showSaveIndicator();
            this.calculate();
        });

        // Records
        this.elements.recordsToHydrate.addEventListener('input', () => {
            storage.save(STORAGE_KEYS.recordsMillions, parseFloat(this.elements.recordsToHydrate.value) || 0);
            this.showSaveIndicator();
            this.calculate();
        });

        // Bandwidth
        this.elements.bandwidthLimit.addEventListener('input', () => {
            storage.save(STORAGE_KEYS.bandwidthLimitTb, parseFloat(this.elements.bandwidthLimit.value) || 0);
            this.showSaveIndicator();
            this.calculate();
        });

        // Profile change rate
        this.elements.profileChangeSlider.addEventListener('input', () => {
            const value = Math.min(100, Math.max(0, parseFloat(this.elements.profileChangeSlider.value) || 0));
            this.elements.profileChangeRate.value = value;
            storage.save(STORAGE_KEYS.profileChangeRate, value);
            this.showSaveIndicator();
            this.calculate();
        });

        this.elements.profileChangeRate.addEventListener('input', () => {
            let value = Math.min(100, Math.max(0, parseFloat(this.elements.profileChangeRate.value) || 0));
            this.elements.profileChangeRate.value = value;
            this.elements.profileChangeSlider.value = value;
            storage.save(STORAGE_KEYS.profileChangeRate, value);
            this.showSaveIndicator();
            this.calculate();
        });

        // Consent change rate
        this.elements.consentChangeSlider.addEventListener('input', () => {
            const value = Math.min(100, Math.max(0, parseFloat(this.elements.consentChangeSlider.value) || 0));
            this.elements.consentChangeRate.value = value;
            storage.save(STORAGE_KEYS.consentChangeRate, value);
            this.showSaveIndicator();
            this.calculate();
        });

        this.elements.consentChangeRate.addEventListener('input', () => {
            let value = Math.min(100, Math.max(0, parseFloat(this.elements.consentChangeRate.value) || 0));
            this.elements.consentChangeRate.value = value;
            this.elements.consentChangeSlider.value = value;
            storage.save(STORAGE_KEYS.consentChangeRate, value);
            this.showSaveIndicator();
            this.calculate();
        });

        // Growth date
        this.elements.growthDate.addEventListener('change', () => {
            storage.save(STORAGE_KEYS.growthDate, this.elements.growthDate.value);
            this.showSaveIndicator();
            this.calculate();
        });

        // Growth multiplier
        this.elements.growthMultiplier.addEventListener('input', () => {
            storage.save(STORAGE_KEYS.growthMultiplier, parseFloat(this.elements.growthMultiplier.value) || 1);
            this.showSaveIndicator();
            this.calculate();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetToDefaults());

        // Schemas toggle
        this.elements.schemasToggle.addEventListener('click', () => this.toggleSchemas());

        // Generate payloads button
        this.elements.generatePayloadsBtn.addEventListener('click', () => this.generatePayloads());
    }

    toggleSchemas() {
        const content = this.elements.schemasContent;
        const icon = this.elements.schemasToggleIcon;

        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.classList.add('rotated');
        } else {
            content.classList.add('hidden');
            icon.classList.remove('rotated');
        }
    }

    generatePayloads() {
        const wirelessCount = parseInt(this.elements.wirelessCount.value) || 0;
        const wirelineCount = parseInt(this.elements.wirelineCount.value) || 0;

        // Generate profile payload
        const profilePayload = generateProfilePayload(wirelessCount, wirelineCount);
        const profileJson = JSON.stringify(profilePayload, null, 2);
        this.elements.profilePayload.value = profileJson;
        storage.save(STORAGE_KEYS.profileJson, profileJson);

        // Generate consent payload
        const consentPayload = generateConsentPayload(wirelessCount, wirelineCount);
        const consentJson = JSON.stringify(consentPayload, null, 2);
        this.elements.consentPayload.value = consentJson;
        storage.save(STORAGE_KEYS.consentJson, consentJson);

        // Generate optimized profile payload (minified - no spaces/newlines)
        const optimizedProfilePayload = generateOptimizedProfilePayload(wirelessCount, wirelineCount);
        const optimizedProfileJson = JSON.stringify(optimizedProfilePayload);
        this.elements.optimizedProfilePayload.value = optimizedProfileJson;
        storage.save(STORAGE_KEYS.optimizedProfileJson, optimizedProfileJson);

        // Generate optimized consent payload (minified - no spaces/newlines)
        const optimizedConsentPayload = generateOptimizedConsentPayload(wirelessCount, wirelineCount);
        const optimizedConsentJson = JSON.stringify(optimizedConsentPayload);
        this.elements.optimizedConsentPayload.value = optimizedConsentJson;
        storage.save(STORAGE_KEYS.optimizedConsentJson, optimizedConsentJson);

        // Update UI
        this.updatePreviews();
        this.calculate();
        this.showSaveIndicator();
    }

    togglePayload(type) {
        const panelMap = {
            profile: this.elements.profilePanel,
            consent: this.elements.consentPanel,
            optimizedProfile: this.elements.optimizedProfilePanel,
            optimizedConsent: this.elements.optimizedConsentPanel
        };

        const panel = panelMap[type];
        if (panel) {
            panel.classList.toggle('expanded');
            this.saveUiState();
        }
    }

    saveUiState() {
        const uiState = {
            profileExpanded: this.elements.profilePanel.classList.contains('expanded'),
            consentExpanded: this.elements.consentPanel.classList.contains('expanded'),
            optimizedProfileExpanded: this.elements.optimizedProfilePanel.classList.contains('expanded'),
            optimizedConsentExpanded: this.elements.optimizedConsentPanel.classList.contains('expanded')
        };
        storage.save(STORAGE_KEYS.uiState, uiState);
    }

    updatePreviews() {
        // Original
        const profileLines = this.elements.profilePayload.value.split('\n').slice(0, 3);
        this.elements.profilePreview.textContent = profileLines.join('\n') + '\n...';

        const consentLines = this.elements.consentPayload.value.split('\n').slice(0, 3);
        this.elements.consentPreview.textContent = consentLines.join('\n') + '\n...';

        // Optimized
        const optProfileLines = this.elements.optimizedProfilePayload.value.split('\n').slice(0, 3);
        this.elements.optimizedProfilePreview.textContent = optProfileLines.join('\n') + '\n...';

        const optConsentLines = this.elements.optimizedConsentPayload.value.split('\n').slice(0, 3);
        this.elements.optimizedConsentPreview.textContent = optConsentLines.join('\n') + '\n...';
    }

    debouncedSave(key, value) {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            storage.save(key, value);
            this.showSaveIndicator();
        }, 500);
    }

    showSaveIndicator() {
        this.elements.saveIndicator.classList.add('visible');
        setTimeout(() => this.elements.saveIndicator.classList.remove('visible'), 1500);
    }

    getInputs() {
        return {
            profileJson: this.elements.profilePayload.value,
            consentJson: this.elements.consentPayload.value,
            optimizedProfileJson: this.elements.optimizedProfilePayload.value,
            optimizedConsentJson: this.elements.optimizedConsentPayload.value,
            useOptimized: this.elements.useOptimized.checked,
            compressionType: this.elements.compressionType.value,
            recordsMillions: parseFloat(this.elements.recordsToHydrate.value) || 0,
            bandwidthLimitTb: parseFloat(this.elements.bandwidthLimit.value) || 0,
            profileChangeRate: parseFloat(this.elements.profileChangeRate.value) || 0,
            consentChangeRate: parseFloat(this.elements.consentChangeRate.value) || 0,
            growthDate: this.elements.growthDate.value,
            growthMultiplier: parseFloat(this.elements.growthMultiplier.value) || 1
        };
    }

    calculate() {
        const inputs = this.getInputs();
        const results = calculator.calculate(inputs);

        // Update byte counts for original payloads
        const profileBytes = new TextEncoder().encode(inputs.profileJson).length;
        const consentBytes = new TextEncoder().encode(inputs.consentJson).length;
        this.elements.profileByteCount.textContent = formatNumber(profileBytes) + ' bytes';
        this.elements.consentByteCount.textContent = formatNumber(consentBytes) + ' bytes';

        // Update byte counts for optimized payloads
        const optProfileBytes = new TextEncoder().encode(inputs.optimizedProfileJson).length;
        const optConsentBytes = new TextEncoder().encode(inputs.optimizedConsentJson).length;
        this.elements.optimizedProfileByteCount.textContent = formatNumber(optProfileBytes) + ' bytes';
        this.elements.optimizedConsentByteCount.textContent = formatNumber(optConsentBytes) + ' bytes';

        // Handle validation errors
        if (!results.valid) {
            // Original payload errors
            this.elements.profilePayload.classList.toggle('error', !!results.profileError);
            this.elements.consentPayload.classList.toggle('error', !!results.consentError);
            this.elements.profileError.textContent = results.profileError ? 'Invalid JSON' : '';
            this.elements.consentError.textContent = results.consentError ? 'Invalid JSON' : '';

            // Optimized payload errors
            this.elements.optimizedProfilePayload.classList.toggle('error', !!results.optimizedProfileError);
            this.elements.optimizedConsentPayload.classList.toggle('error', !!results.optimizedConsentError);
            this.elements.optimizedProfileError.textContent = results.optimizedProfileError ? 'Invalid JSON' : '';
            this.elements.optimizedConsentError.textContent = results.optimizedConsentError ? 'Invalid JSON' : '';
            return;
        }

        // Clear all errors
        this.elements.profilePayload.classList.remove('error');
        this.elements.consentPayload.classList.remove('error');
        this.elements.optimizedProfilePayload.classList.remove('error');
        this.elements.optimizedConsentPayload.classList.remove('error');
        this.elements.profileError.textContent = '';
        this.elements.consentError.textContent = '';
        this.elements.optimizedProfileError.textContent = '';
        this.elements.optimizedConsentError.textContent = '';

        // Update savings displays
        const profileSavings = results.profileSavingsPercent;
        const consentSavings = results.consentSavingsPercent;
        this.elements.optimizedProfileSavings.textContent = profileSavings > 0
            ? `(${profileSavings.toFixed(1)}% smaller)`
            : profileSavings < 0 ? `(${Math.abs(profileSavings).toFixed(1)}% larger)` : '';
        this.elements.optimizedConsentSavings.textContent = consentSavings > 0
            ? `(${consentSavings.toFixed(1)}% smaller)`
            : consentSavings < 0 ? `(${Math.abs(consentSavings).toFixed(1)}% larger)` : '';

        this.updateResults(results, inputs);
        chartManager.update(results.chartData, inputs.bandwidthLimitTb, inputs.useOptimized);
    }

    updateResults(results, inputs) {
        // Hydration summary
        this.elements.hydrationRecords.textContent = formatCompactNumber(results.totalRecords);
        this.elements.hydrationSize.textContent = formatBytes(results.hydrationBytes);
        this.elements.hydrationPercent.textContent = formatPercent((results.hydrationBytes / results.annualLimitBytes) * 100);
        this.elements.hydrationRemaining.textContent = formatBytes(Math.max(0, results.remainingAfterHydration));

        // Daily sync
        this.elements.dailyProfileRecords.textContent = formatCompactNumber(results.profileDailyRecords) + ` (${inputs.profileChangeRate}%)`;
        this.elements.dailyConsentRecords.textContent = formatCompactNumber(results.consentDailyRecords) + ` (${inputs.consentChangeRate}%)`;
        this.elements.dailyTotalRecords.textContent = formatCompactNumber(results.totalDailyRecords);
        this.elements.dailySize.textContent = formatBytes(results.dailyBytes) + '/day';
        this.elements.monthlySize.textContent = formatBytes(results.dailyBytes * 30);

        // Budget forecast
        this.updateBudgetForecast(results);

        // Growth projection
        this.updateGrowthProjection(results, inputs);
    }

    updateBudgetForecast(results) {
        const card = this.elements.budgetCard;
        card.classList.remove('success', 'warning', 'danger');

        if (results.remainingAfterHydration < 0) {
            this.elements.forecastDays.textContent = 'OVER BUDGET';
            this.elements.forecastMonths.textContent = '-';
            this.elements.forecastSustainable.innerHTML = '<span class="badge badge-danger">NO</span>';
            this.elements.forecastUsage.textContent = formatPercent(results.annualUsagePercent);
            card.classList.add('danger');
        } else if (results.daysAvailable === Infinity) {
            this.elements.forecastDays.textContent = '∞';
            this.elements.forecastMonths.textContent = '∞';
            this.elements.forecastSustainable.innerHTML = '<span class="badge badge-success">YES</span>';
            this.elements.forecastUsage.textContent = formatPercent((results.hydrationBytes / results.annualLimitBytes) * 100);
            card.classList.add('success');
        } else {
            this.elements.forecastDays.textContent = formatDays(results.daysAvailable) + ' days';
            this.elements.forecastMonths.textContent = (results.daysAvailable / 30).toFixed(1) + ' months';

            if (results.annualUsagePercent <= 80) {
                this.elements.forecastSustainable.innerHTML = '<span class="badge badge-success">YES</span>';
                card.classList.add('success');
            } else if (results.annualUsagePercent <= 100) {
                this.elements.forecastSustainable.innerHTML = '<span class="badge badge-warning">CAUTION</span>';
                card.classList.add('warning');
            } else {
                this.elements.forecastSustainable.innerHTML = '<span class="badge badge-danger">NO</span>';
                card.classList.add('danger');
            }

            this.elements.forecastUsage.textContent = formatPercent(results.annualUsagePercent);
        }
    }

    updateGrowthProjection(results, inputs) {
        const gp = results.growthProjection;

        // Show/hide warnings
        this.elements.growthDateWarning.classList.toggle('hidden', !gp.dateInPast);
        this.elements.growthMultiplierInfo.classList.toggle('hidden', !gp.multiplierLessThanOne);

        // Update display values
        this.elements.growthDateDisplay.textContent = formatDate(gp.growthDate);
        this.elements.growthMultiplierDisplay.textContent = inputs.growthMultiplier + 'x';

        // Comparison table
        this.elements.growthProfileCurrent.textContent = formatBytes(results.profileCompressed);
        this.elements.growthProfileAfter.textContent = formatBytes(gp.profileCompressedGrown);
        this.elements.growthConsentCurrent.textContent = formatBytes(results.consentCompressed);
        this.elements.growthConsentAfter.textContent = formatBytes(gp.consentCompressedGrown);
        this.elements.growthCombinedCurrent.textContent = formatBytes(results.combinedCompressed);
        this.elements.growthCombinedAfter.textContent = formatBytes(gp.combinedCompressedGrown);
        this.elements.growthDailyCurrent.textContent = formatBytes(results.dailyBytes);
        this.elements.growthDailyAfter.textContent = formatBytes(gp.dailyBytesGrown);

        // Impact
        this.elements.growthDaysAtCurrent.textContent = formatDays(gp.daysAtCurrentSize) + ' days';
        this.elements.growthDaysAtGrown.textContent = formatDays(gp.daysAtGrownSize) + ' days';
        this.elements.growthTotalDays.textContent = formatDays(gp.totalDays) + ' days';

        const usageEl = this.elements.growthProjectedUsage;
        usageEl.textContent = formatPercent(gp.projectedAnnualUsage);
        usageEl.classList.remove('text-green-600', 'text-yellow-600', 'text-red-600');
        if (gp.projectedAnnualUsage > 100) {
            usageEl.classList.add('text-red-600');
        } else if (gp.projectedAnnualUsage > 80) {
            usageEl.classList.add('text-yellow-600');
        } else {
            usageEl.classList.add('text-green-600');
        }
    }

    resetToDefaults() {
        if (!confirm('Reset all settings to defaults?')) return;

        storage.clear();

        // Original payloads
        this.elements.profilePayload.value = JSON.stringify(DEFAULT_PROFILE_PAYLOAD, null, 2);
        this.elements.consentPayload.value = JSON.stringify(DEFAULT_CONSENT_PAYLOAD, null, 2);

        // Optimized payloads
        this.elements.optimizedProfilePayload.value = JSON.stringify(DEFAULT_OPTIMIZED_PROFILE_PAYLOAD, null, 2);
        this.elements.optimizedConsentPayload.value = JSON.stringify(DEFAULT_OPTIMIZED_CONSENT_PAYLOAD, null, 2);
        this.elements.useOptimized.checked = false;

        // Config
        this.elements.compressionType.value = 'bzip2';
        this.elements.recordsToHydrate.value = 150;
        this.elements.bandwidthLimit.value = 2;
        this.elements.profileChangeRate.value = 10;
        this.elements.profileChangeSlider.value = 10;
        this.elements.consentChangeRate.value = 5;
        this.elements.consentChangeSlider.value = 5;
        this.elements.growthDate.value = storage.getDefaultGrowthDate();
        this.elements.growthMultiplier.value = 1.5;

        // Reset panel states
        this.elements.profilePanel.classList.remove('expanded');
        this.elements.consentPanel.classList.remove('expanded');
        this.elements.optimizedProfilePanel.classList.remove('expanded');
        this.elements.optimizedConsentPanel.classList.remove('expanded');

        this.updatePreviews();
        this.calculate();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

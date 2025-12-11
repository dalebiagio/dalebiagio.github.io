import { storage } from './storage.js';
import { calculator } from './calculator.js';
import { chartManager } from './chart.js';
import {
    STORAGE_KEYS,
    DEFAULT_PROFILE_SCHEMA,
    DEFAULT_CONSENT_SCHEMA,
    DEFAULT_OPTIMIZED_PROFILE_SCHEMA,
    DEFAULT_OPTIMIZED_CONSENT_SCHEMA
} from './constants.js';
import { formatNumber, formatBytes, formatPercent, formatDays, formatDate, formatCompactNumber } from './formatters.js';

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
        chartManager.init('usageChart');
        this.calculate();

        // Show warning if localStorage unavailable
        if (!storage.available) {
            this.elements.warningBanner.classList.remove('hidden');
        }
    }

    cacheElements() {
        this.elements = {
            // Original Schema
            profileSchema: document.getElementById('profileSchema'),
            consentSchema: document.getElementById('consentSchema'),
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

            // Optimized Schema
            optimizedProfileSchema: document.getElementById('optimizedProfileSchema'),
            optimizedConsentSchema: document.getElementById('optimizedConsentSchema'),
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
            saveIndicator: document.getElementById('saveIndicator')
        };
    }

    loadSettings() {
        const settings = storage.loadAllSettings();

        // Original schemas
        this.elements.profileSchema.value = settings.profileJson;
        this.elements.consentSchema.value = settings.consentJson;

        // Optimized schemas
        this.elements.optimizedProfileSchema.value = settings.optimizedProfileJson;
        this.elements.optimizedConsentSchema.value = settings.optimizedConsentJson;
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
        // Original schema textareas
        this.elements.profileSchema.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.profileJson, this.elements.profileSchema.value);
            this.calculate();
        });

        this.elements.consentSchema.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.consentJson, this.elements.consentSchema.value);
            this.calculate();
        });

        // Optimized schema textareas
        this.elements.optimizedProfileSchema.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.optimizedProfileJson, this.elements.optimizedProfileSchema.value);
            this.calculate();
        });

        this.elements.optimizedConsentSchema.addEventListener('input', () => {
            this.updatePreviews();
            this.debouncedSave(STORAGE_KEYS.optimizedConsentJson, this.elements.optimizedConsentSchema.value);
            this.calculate();
        });

        // Use optimized toggle
        this.elements.useOptimized.addEventListener('change', () => {
            storage.save(STORAGE_KEYS.useOptimized, this.elements.useOptimized.checked);
            this.showSaveIndicator();
            this.calculate();
        });

        // Schema toggles
        this.elements.profileToggle.addEventListener('click', () => this.toggleSchema('profile'));
        this.elements.consentToggle.addEventListener('click', () => this.toggleSchema('consent'));
        this.elements.optimizedProfileToggle.addEventListener('click', () => this.toggleSchema('optimizedProfile'));
        this.elements.optimizedConsentToggle.addEventListener('click', () => this.toggleSchema('optimizedConsent'));

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
    }

    toggleSchema(type) {
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
        const profileLines = this.elements.profileSchema.value.split('\n').slice(0, 3);
        this.elements.profilePreview.textContent = profileLines.join('\n') + '\n...';

        const consentLines = this.elements.consentSchema.value.split('\n').slice(0, 3);
        this.elements.consentPreview.textContent = consentLines.join('\n') + '\n...';

        // Optimized
        const optProfileLines = this.elements.optimizedProfileSchema.value.split('\n').slice(0, 3);
        this.elements.optimizedProfilePreview.textContent = optProfileLines.join('\n') + '\n...';

        const optConsentLines = this.elements.optimizedConsentSchema.value.split('\n').slice(0, 3);
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
            profileJson: this.elements.profileSchema.value,
            consentJson: this.elements.consentSchema.value,
            optimizedProfileJson: this.elements.optimizedProfileSchema.value,
            optimizedConsentJson: this.elements.optimizedConsentSchema.value,
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

        // Update byte counts for original schemas
        const profileBytes = new TextEncoder().encode(inputs.profileJson).length;
        const consentBytes = new TextEncoder().encode(inputs.consentJson).length;
        this.elements.profileByteCount.textContent = formatNumber(profileBytes) + ' bytes';
        this.elements.consentByteCount.textContent = formatNumber(consentBytes) + ' bytes';

        // Update byte counts for optimized schemas
        const optProfileBytes = new TextEncoder().encode(inputs.optimizedProfileJson).length;
        const optConsentBytes = new TextEncoder().encode(inputs.optimizedConsentJson).length;
        this.elements.optimizedProfileByteCount.textContent = formatNumber(optProfileBytes) + ' bytes';
        this.elements.optimizedConsentByteCount.textContent = formatNumber(optConsentBytes) + ' bytes';

        // Handle validation errors
        if (!results.valid) {
            // Original schema errors
            this.elements.profileSchema.classList.toggle('error', !!results.profileError);
            this.elements.consentSchema.classList.toggle('error', !!results.consentError);
            this.elements.profileError.textContent = results.profileError ? 'Invalid JSON' : '';
            this.elements.consentError.textContent = results.consentError ? 'Invalid JSON' : '';

            // Optimized schema errors
            this.elements.optimizedProfileSchema.classList.toggle('error', !!results.optimizedProfileError);
            this.elements.optimizedConsentSchema.classList.toggle('error', !!results.optimizedConsentError);
            this.elements.optimizedProfileError.textContent = results.optimizedProfileError ? 'Invalid JSON' : '';
            this.elements.optimizedConsentError.textContent = results.optimizedConsentError ? 'Invalid JSON' : '';
            return;
        }

        // Clear all errors
        this.elements.profileSchema.classList.remove('error');
        this.elements.consentSchema.classList.remove('error');
        this.elements.optimizedProfileSchema.classList.remove('error');
        this.elements.optimizedConsentSchema.classList.remove('error');
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

        // Original schemas
        this.elements.profileSchema.value = JSON.stringify(DEFAULT_PROFILE_SCHEMA, null, 2);
        this.elements.consentSchema.value = JSON.stringify(DEFAULT_CONSENT_SCHEMA, null, 2);

        // Optimized schemas
        this.elements.optimizedProfileSchema.value = JSON.stringify(DEFAULT_OPTIMIZED_PROFILE_SCHEMA, null, 2);
        this.elements.optimizedConsentSchema.value = JSON.stringify(DEFAULT_OPTIMIZED_CONSENT_SCHEMA, null, 2);
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

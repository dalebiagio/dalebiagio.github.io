import { COMPRESSION_RATIOS } from './constants.js';

export class Calculator {
    constructor() {
        this.results = null;
    }

    getByteLength(str) {
        return new TextEncoder().encode(str).length;
    }

    validateJson(str) {
        try {
            JSON.parse(str);
            return { valid: true, error: null };
        } catch (e) {
            return { valid: false, error: e.message };
        }
    }

    calculate(inputs) {
        const {
            profileJson,
            consentJson,
            optimizedProfileJson,
            optimizedConsentJson,
            useOptimized,
            compressionType,
            recordsMillions,
            bandwidthLimitTb,
            profileChangeRate,
            consentChangeRate,
            growthDate,
            growthMultiplier
        } = inputs;

        // Validate original JSONs
        const profileValidation = this.validateJson(profileJson);
        const consentValidation = this.validateJson(consentJson);

        // Validate optimized JSONs
        const optimizedProfileValidation = this.validateJson(optimizedProfileJson);
        const optimizedConsentValidation = this.validateJson(optimizedConsentJson);

        if (!profileValidation.valid || !consentValidation.valid) {
            return {
                valid: false,
                profileError: profileValidation.error,
                consentError: consentValidation.error,
                optimizedProfileError: null,
                optimizedConsentError: null
            };
        }

        if (!optimizedProfileValidation.valid || !optimizedConsentValidation.valid) {
            return {
                valid: false,
                profileError: null,
                consentError: null,
                optimizedProfileError: optimizedProfileValidation.error,
                optimizedConsentError: optimizedConsentValidation.error
            };
        }

        // Get byte lengths for original schemas
        const profileBytes = this.getByteLength(profileJson);
        const consentBytes = this.getByteLength(consentJson);

        // Get byte lengths for optimized schemas
        const optimizedProfileBytes = this.getByteLength(optimizedProfileJson);
        const optimizedConsentBytes = this.getByteLength(optimizedConsentJson);

        // Compression
        const compressionRatio = COMPRESSION_RATIOS[compressionType];

        // Original compressed sizes
        const profileCompressed = profileBytes / compressionRatio;
        const consentCompressed = consentBytes / compressionRatio;
        const combinedCompressed = profileCompressed + consentCompressed;

        // Optimized compressed sizes
        const optimizedProfileCompressed = optimizedProfileBytes / compressionRatio;
        const optimizedConsentCompressed = optimizedConsentBytes / compressionRatio;
        const optimizedCombinedCompressed = optimizedProfileCompressed + optimizedConsentCompressed;

        // Totals
        const totalRecords = recordsMillions * 1000000;
        const annualLimitBytes = bandwidthLimitTb * 1024 * 1024 * 1024 * 1024;

        // Calculate for original schema
        const originalCalc = this.calculateMetrics({
            profileCompressed,
            consentCompressed,
            combinedCompressed,
            totalRecords,
            annualLimitBytes,
            profileChangeRate,
            consentChangeRate,
            growthDate,
            growthMultiplier
        });

        // Calculate for optimized schema
        const optimizedCalc = this.calculateMetrics({
            profileCompressed: optimizedProfileCompressed,
            consentCompressed: optimizedConsentCompressed,
            combinedCompressed: optimizedCombinedCompressed,
            totalRecords,
            annualLimitBytes,
            profileChangeRate,
            consentChangeRate,
            growthDate,
            growthMultiplier
        });

        // Generate chart data with both lines
        const chartData = this.generateChartData({
            // Original
            hydrationBytes: originalCalc.hydrationBytes,
            dailyBytes: originalCalc.dailyBytes,
            dailyBytesGrown: originalCalc.growthProjection.dailyBytesGrown,
            // Optimized
            optimizedHydrationBytes: optimizedCalc.hydrationBytes,
            optimizedDailyBytes: optimizedCalc.dailyBytes,
            optimizedDailyBytesGrown: optimizedCalc.growthProjection.dailyBytesGrown,
            // Common
            annualLimitBytes,
            growthDate
        });

        // Use optimized or original for display based on toggle
        const activeCalc = useOptimized ? optimizedCalc : originalCalc;

        this.results = {
            valid: true,
            // Original schema info
            profileBytes,
            consentBytes,
            profileCompressed,
            consentCompressed,
            combinedCompressed,
            // Optimized schema info
            optimizedProfileBytes,
            optimizedConsentBytes,
            optimizedProfileCompressed,
            optimizedConsentCompressed,
            optimizedCombinedCompressed,
            // Savings calculations
            profileSavingsPercent: ((profileBytes - optimizedProfileBytes) / profileBytes) * 100,
            consentSavingsPercent: ((consentBytes - optimizedConsentBytes) / consentBytes) * 100,
            // Common
            compressionRatio,
            totalRecords,
            annualLimitBytes,
            // Active (based on toggle)
            ...activeCalc,
            // Both calculations for comparison
            original: originalCalc,
            optimized: optimizedCalc,
            // Chart data with both lines
            chartData,
            // Flag
            useOptimized
        };

        return this.results;
    }

    calculateMetrics(params) {
        const {
            profileCompressed,
            consentCompressed,
            combinedCompressed,
            totalRecords,
            annualLimitBytes,
            profileChangeRate,
            consentChangeRate,
            growthDate,
            growthMultiplier
        } = params;

        const hydrationBytes = totalRecords * combinedCompressed;

        // Daily sync
        const profileDailyRecords = totalRecords * (profileChangeRate / 100);
        const consentDailyRecords = totalRecords * (consentChangeRate / 100);
        const totalDailyRecords = profileDailyRecords + consentDailyRecords;
        const dailyBytes = (profileDailyRecords * profileCompressed) + (consentDailyRecords * consentCompressed);

        // Budget
        const remainingAfterHydration = annualLimitBytes - hydrationBytes;
        const daysAvailable = dailyBytes > 0 ? remainingAfterHydration / dailyBytes : Infinity;
        const annualUsageBytes = hydrationBytes + (dailyBytes * 350);
        const annualUsagePercent = (annualUsageBytes / annualLimitBytes) * 100;
        const sustainable = annualUsagePercent <= 100;

        // Growth projection
        const growthProjection = this.calculateGrowthProjection({
            profileCompressed,
            consentCompressed,
            dailyBytes,
            hydrationBytes,
            remainingAfterHydration,
            annualLimitBytes,
            profileDailyRecords,
            consentDailyRecords,
            growthDate,
            growthMultiplier
        });

        return {
            profileCompressed,
            consentCompressed,
            combinedCompressed,
            hydrationBytes,
            profileDailyRecords,
            consentDailyRecords,
            totalDailyRecords,
            dailyBytes,
            remainingAfterHydration,
            daysAvailable,
            annualUsageBytes,
            annualUsagePercent,
            sustainable,
            growthProjection
        };
    }

    calculateGrowthProjection(params) {
        const {
            profileCompressed,
            consentCompressed,
            dailyBytes,
            hydrationBytes,
            remainingAfterHydration,
            annualLimitBytes,
            profileDailyRecords,
            consentDailyRecords,
            growthDate: growthDateStr,
            growthMultiplier
        } = params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let growthDate = new Date(growthDateStr + 'T00:00:00');
        const dateInPast = growthDate <= today;
        if (dateInPast) {
            growthDate = new Date(today);
        }

        const daysUntilGrowth = Math.max(0, Math.floor((growthDate - today) / (1000 * 60 * 60 * 24)));

        // Grown sizes
        const profileCompressedGrown = profileCompressed * growthMultiplier;
        const consentCompressedGrown = consentCompressed * growthMultiplier;
        const combinedCompressedGrown = profileCompressedGrown + consentCompressedGrown;
        const dailyBytesGrown = (profileDailyRecords * profileCompressedGrown) + (consentDailyRecords * consentCompressedGrown);

        const daysAtCurrentSizeTotal = dailyBytes > 0 ? remainingAfterHydration / dailyBytes : Infinity;

        let daysAtCurrentSize, daysAtGrownSize, totalDays, projectedAnnualUsage;

        if (remainingAfterHydration <= 0) {
            daysAtCurrentSize = 0;
            daysAtGrownSize = 0;
            totalDays = 0;
            projectedAnnualUsage = (hydrationBytes / annualLimitBytes) * 100;
        } else if (dailyBytes === 0) {
            daysAtCurrentSize = Infinity;
            daysAtGrownSize = Infinity;
            totalDays = Infinity;
            projectedAnnualUsage = (hydrationBytes / annualLimitBytes) * 100;
        } else if (daysAtCurrentSizeTotal <= daysUntilGrowth) {
            daysAtCurrentSize = daysAtCurrentSizeTotal;
            daysAtGrownSize = 0;
            totalDays = daysAtCurrentSize;
            projectedAnnualUsage = 100;
        } else {
            daysAtCurrentSize = daysUntilGrowth;
            const budgetUsedBeforeGrowth = dailyBytes * daysUntilGrowth;
            const remainingAtGrowth = remainingAfterHydration - budgetUsedBeforeGrowth;
            daysAtGrownSize = dailyBytesGrown > 0 ? remainingAtGrowth / dailyBytesGrown : Infinity;
            totalDays = daysAtCurrentSize + daysAtGrownSize;

            if (totalDays >= 350) {
                const daysAtGrown350 = Math.max(0, 350 - daysUntilGrowth);
                const daysAtCurrent350 = Math.min(daysUntilGrowth, 350);
                const annualUsage = hydrationBytes + (dailyBytes * daysAtCurrent350) + (dailyBytesGrown * daysAtGrown350);
                projectedAnnualUsage = (annualUsage / annualLimitBytes) * 100;
            } else {
                projectedAnnualUsage = 100;
            }
        }

        return {
            growthDate,
            dateInPast,
            daysUntilGrowth,
            profileCompressedGrown,
            consentCompressedGrown,
            combinedCompressedGrown,
            dailyBytesGrown,
            daysAtCurrentSize,
            daysAtGrownSize,
            totalDays,
            projectedAnnualUsage,
            multiplierLessThanOne: growthMultiplier < 1
        };
    }

    generateChartData(params) {
        const {
            hydrationBytes,
            dailyBytes,
            dailyBytesGrown,
            optimizedHydrationBytes,
            optimizedDailyBytes,
            optimizedDailyBytesGrown,
            annualLimitBytes,
            growthDate: growthDateStr
        } = params;

        // Chart shows Jan 1, 2026 to Dec 31, 2026
        const startDate = new Date('2026-01-01');
        const endDate = new Date('2026-12-31');
        const growthDate = new Date(growthDateStr + 'T00:00:00');

        const labels = [];
        const originalData = [];
        const optimizedData = [];
        const limitData = [];

        let originalCumulative = hydrationBytes;
        let optimizedCumulative = optimizedHydrationBytes;
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            labels.push(new Date(currentDate));

            // Check if we're past growth date
            const isPastGrowth = currentDate >= growthDate;
            const originalDailyRate = isPastGrowth ? dailyBytesGrown : dailyBytes;
            const optimizedDailyRate = isPastGrowth ? optimizedDailyBytesGrown : optimizedDailyBytes;

            originalCumulative += originalDailyRate;
            optimizedCumulative += optimizedDailyRate;

            originalData.push(originalCumulative);
            optimizedData.push(optimizedCumulative);
            limitData.push(annualLimitBytes);

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Convert to TB for display
        const originalTB = originalData.map(b => b / (1024 * 1024 * 1024 * 1024));
        const optimizedTB = optimizedData.map(b => b / (1024 * 1024 * 1024 * 1024));
        const limitTB = limitData.map(b => b / (1024 * 1024 * 1024 * 1024));

        return {
            labels,
            originalTB,
            optimizedTB,
            limitTB,
            growthDate
        };
    }
}

export const calculator = new Calculator();

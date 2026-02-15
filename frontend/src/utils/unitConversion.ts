// Unit conversion utilities for pantry items

export type MeasurementSystem = 'metric' | 'imperial';
export type Unit = 'kg' | 'g' | 'lb' | 'oz' | 'L' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'item';

interface ConversionResult {
    value: number;
    unit: string;
    originalValue: number;
    originalUnit: string;
}

// Conversion factors to metric base units
const CONVERSION_FACTORS: Record<string, { toMetric: number; metricUnit: string }> = {
    // Weight - convert to kg
    'kg': { toMetric: 1, metricUnit: 'kg' },
    'g': { toMetric: 0.001, metricUnit: 'kg' },
    'lb': { toMetric: 0.453592, metricUnit: 'kg' },
    'oz': { toMetric: 0.0283495, metricUnit: 'kg' },

    // Volume - convert to L
    'L': { toMetric: 1, metricUnit: 'L' },
    'ml': { toMetric: 0.001, metricUnit: 'L' },
    'cup': { toMetric: 0.236588, metricUnit: 'L' },
    'tbsp': { toMetric: 0.0147868, metricUnit: 'L' },
    'tsp': { toMetric: 0.00492892, metricUnit: 'L' },

    // Count-based (no conversion)
    'item': { toMetric: 1, metricUnit: 'item' }
};

/**
 * Determines if a unit can be converted
 */
export const isConvertible = (unit: string): boolean => {
    return unit !== 'item' && unit in CONVERSION_FACTORS;
};

/**
 * Gets the appropriate display unit for a given measurement system
 */
export const getDisplayUnit = (originalUnit: string, preferredSystem: MeasurementSystem): string => {
    if (!isConvertible(originalUnit)) return originalUnit;

    const conversionInfo = CONVERSION_FACTORS[originalUnit];
    const isWeight = conversionInfo.metricUnit === 'kg';
    const isVolume = conversionInfo.metricUnit === 'L';

    if (preferredSystem === 'metric') {
        if (isWeight) return 'kg';
        if (isVolume) return 'L';
    } else {
        if (isWeight) return 'lb';
        if (isVolume) return 'cup';
    }

    return originalUnit;
};

/**
 * Converts a value from one unit to another based on preferred system
 */
export const convertUnit = (
    value: number | string,
    fromUnit: string,
    toSystem: MeasurementSystem
): ConversionResult => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // If unit is not convertible or invalid, return as-is
    if (!isConvertible(fromUnit) || isNaN(numValue)) {
        return {
            value: numValue,
            unit: fromUnit,
            originalValue: numValue,
            originalUnit: fromUnit
        };
    }

    const conversionInfo = CONVERSION_FACTORS[fromUnit];
    const isWeight = conversionInfo.metricUnit === 'kg';
    const isVolume = conversionInfo.metricUnit === 'L';

    // Convert to metric base unit first
    const metricValue = numValue * conversionInfo.toMetric;

    let convertedValue: number;
    let convertedUnit: string;

    if (toSystem === 'metric') {
        // For metric, use appropriate unit based on size
        if (isWeight) {
            if (metricValue < 1) {
                convertedValue = metricValue * 1000; // Convert to grams
                convertedUnit = 'g';
            } else {
                convertedValue = metricValue;
                convertedUnit = 'kg';
            }
        } else if (isVolume) {
            if (metricValue < 1) {
                convertedValue = metricValue * 1000; // Convert to ml
                convertedUnit = 'ml';
            } else {
                convertedValue = metricValue;
                convertedUnit = 'L';
            }
        } else {
            convertedValue = numValue;
            convertedUnit = fromUnit;
        }
    } else {
        // For imperial
        if (isWeight) {
            convertedValue = metricValue / 0.453592; // Convert to pounds
            convertedUnit = 'lb';
        } else if (isVolume) {
            convertedValue = metricValue / 0.236588; // Convert to cups
            convertedUnit = 'cup';
        } else {
            convertedValue = numValue;
            convertedUnit = fromUnit;
        }
    }

    return {
        value: convertedValue,
        unit: convertedUnit,
        originalValue: numValue,
        originalUnit: fromUnit
    };
};

/**
 * Formats a converted value for display
 * Shows only the converted value in user's preferred system
 */
export const formatConvertedValue = (conversion: ConversionResult): string => {
    const { value, unit } = conversion;

    // Round to 2 decimal places
    const roundedValue = Math.round(value * 100) / 100;

    // Show only the converted value in preferred system
    return `${roundedValue} ${unit}`;
};

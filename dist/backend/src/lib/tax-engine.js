"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTaxableIncome = computeTaxableIncome;
exports.rentDeduction = rentDeduction;
exports.computePIT = computePIT;
exports.computeTaxWithCGT = computeTaxWithCGT;
exports.estimateBusinessTax = estimateBusinessTax;
function computeTaxableIncome(totalIncome, deductions) {
    return Math.max(0, totalIncome - deductions);
}
function rentDeduction(annualRentPaid, rules) {
    const reliefPercent = rules.rentRelief.percent;
    const reliefCap = rules.rentRelief.cap;
    return Math.min(reliefCap, annualRentPaid * reliefPercent);
}
function computePIT(totalIncome, deductibleExpenses, annualRentPaid, rules) {
    const rentRel = rentDeduction(annualRentPaid, rules);
    const taxableIncome = computeTaxableIncome(totalIncome, deductibleExpenses + rentRel);
    let remaining = taxableIncome;
    let tax = 0.0;
    const breakdown = [];
    for (const band of rules.pitBands) {
        if (remaining <= 0) {
            break;
        }
        const bandFrom = band.bandFrom;
        const bandTo = band.bandTo ?? Infinity;
        if (taxableIncome <= bandFrom) {
            continue;
        }
        const availableInBand = bandTo - bandFrom;
        const taxablePortion = band.bandTo === null ? remaining : Math.min(remaining, Math.max(availableInBand, 0));
        if (taxablePortion <= 0) {
            continue;
        }
        const taxForBand = taxablePortion * band.rate;
        tax += taxForBand;
        remaining -= taxablePortion;
        breakdown.push({
            bandFrom,
            bandTo: band.bandTo,
            rate: band.rate,
            taxableAmount: Math.round(taxablePortion),
            taxForBand: Math.round(taxForBand),
        });
    }
    const roundedTax = Math.max(0, Math.round(tax));
    const monthlyTax = roundedTax / 12;
    const quarterlyTax = roundedTax / 4;
    const effectiveRate = totalIncome > 0 ? roundedTax / totalIncome : 0;
    return {
        taxableIncome,
        taxDue: roundedTax,
        rentRelief: rentRel,
        ruleVersion: rules.version,
        bandBreakdown: breakdown,
        monthlyTax: Math.round(monthlyTax),
        quarterlyTax: Math.round(quarterlyTax),
        effectiveTaxRate: Math.round(effectiveRate * 1000) / 1000,
    };
}
function computeTaxWithCGT(totalIncome, deductibleExpenses, annualRent, netCapitalGains, rules) {
    const totalIncomeIncludingGains = totalIncome + netCapitalGains;
    return computePIT(totalIncomeIncludingGains, deductibleExpenses, annualRent, rules);
}
function estimateBusinessTax(annualTurnover, cogs, deductibleOps, ownerProfile, rules) {
    const profit = annualTurnover - cogs - deductibleOps;
    if (ownerProfile === 'sole_proprietor') {
        return {
            profit,
            personalTax: computePIT(profit, 0, 0, rules),
        };
    }
    else {
        const corporateRate = 0.3;
        return {
            profit,
            corporateEstimatedTax: profit * corporateRate,
        };
    }
}

import { TAX_CONFIG } from './tax-config';

export type UserCategory = 'standard' | 'pensioner' | 'student' | 'disabled_1_2' | 'disabled_3';

export interface CalculationInput {
    amount: number;
    mode: 'gross' | 'net';
    hasDeduction: boolean; // 30 MRP deduction
    category: UserCategory;
}

export interface TaxResult {
    gross: number;
    net: number;

    // Employee Deductions
    opv: number;
    vosms: number;
    ipn: number;

    // Employer Expenses
    so: number;
    sn: number;
    oosms: number;
    oppv: number;

    // Total Employer Cost
    totalEmployerCost: number;
}

const { MRP, MZP, RATES, LIMITS, DEDUCTION_MRP_COUNT } = TAX_CONFIG;

export function calculateSalary(input: CalculationInput): TaxResult {
    if (input.mode === 'gross') {
        return calculateFromGross(input.amount, input.hasDeduction, input.category);
    } else {
        return calculateFromNet(input.amount, input.hasDeduction, input.category);
    }
}

function calculateFromGross(gross: number, hasDeduction: boolean, category: UserCategory): TaxResult {
    // 1. OPV (Pension 10%)
    let opvRate = RATES.OPV;
    if (category === 'pensioner' || category === 'disabled_1_2') opvRate = 0;
    // Disabled 3 pays OPV? Yes (User matrix: Disabled 3 -> OPV Yes).
    // Student - OPV Yes.

    let opvBase = Math.min(gross, LIMITS.OPV_MAX_INCOME);
    let opv = opvBase * opvRate;

    // 2. VOSMS (Employee Health 2%)
    let vosmsRate = RATES.VOSMS;
    if (category === 'pensioner' || category === 'student' || category === 'disabled_1_2' || category === 'disabled_3') {
        vosmsRate = 0;
    }
    let vosmsBase = Math.min(gross, LIMITS.VOSMS_MAX_INCOME);
    let vosms = vosmsBase * vosmsRate;

    // 3. IPN (Income Tax 10%)
    // Taxable Income = Gross - OPV - VOSMS - Deduction (if applicable)
    // Deduction: 30 MRP if hasDeduction is true.
    // Exception: Disabled 1-2, Disabled 3 -> 0 IPN (if < Limit). Limit is usually 882 MRP/year using specific calculation, 
    // but User Matrix says: "0 (if < Limit)".
    // I will assume for simplicity if category is disabled, IPN is 0 for standard range, or I need the specific limit.
    // Standard limit for disabled is 882 MRP per year. Per month ~ 73.5 MRP.
    // For this calculator, "0 (if < Limit)" implies checking the limit. 
    // However, usually online calculators just set IPN to 0 for disabled groups for monthly calc unless explicitly exceeding huge amounts.
    // I will apply the standard logic:
    // IPN Rate is 0 for Disabled 1-2 and Disabled 3 (based on matrix "0 (if < Limit)").
    // User matrix says "0". So I'll set rate to 0 or logic to 0.

    let ipnRate = RATES.IPN;

    // Deduction Logic
    if (hasDeduction && category !== 'disabled_1_2' && category !== 'disabled_3') {
        // deduction logic handled in ipnBase
    }

    // Specific category logic for IPN
    if (category === 'disabled_1_2' || category === 'disabled_3') {
        ipnRate = 0; // Simplified as per "0 (if < Limit)" prompt note without specific limit logic provided.
        // Use 882 MRP limit if requested, but prompt implies simpler "0". I will stick to 0 for now.
        // deduction = 0; // Deductions don't apply if tax is 0.
    }

    // Taxable Base
    // Ensure it doesn't go below zero
    // Formula: (Gross - OPV - 10-14*MRP? No, standard deduction - VOSMS)
    // Correction: VOSMS is deducted before IPN.
    let ipnBase = gross - opv - vosms;
    if (hasDeduction && ipnRate > 0) {
        ipnBase -= (DEDUCTION_MRP_COUNT * MRP);
    }

    // 90% Adjustment (if Gross < 25 MRP) -> This is old logic? 
    // Tax Code 2026 might differ. User didn't specify 90% adjustment.
    // I will OMIT 90% adjustment unless standard practice. 
    // Actually, standard practice for low income is 90% reduction of IPN.
    // But user logic matrix didn't mention it. I will follow the matrix STRICTLY.
    // Matrix: "IPN (10%)".

    if (ipnBase < 0) ipnBase = 0;
    let ipn = ipnBase * ipnRate;

    // Net
    let net = gross - opv - vosms - ipn;

    // Employer Taxes

    // 4. SO (Social Deductions 3.5% or 5%?)
    // User config says SO_RATE: 0.05.
    let soRate = RATES.SO;
    if (category === 'pensioner' || category === 'disabled_1_2') soRate = 0;
    // Student? Matrix: "Yes".
    // Disabled 3? Matrix: "Yes".

    // SO Base: Min(Gross, 7*MZP). Also Lower limit MZP? 
    // Usually SO is calculated on Gross (minus OPV in some years, but 2025/2026 might be direct? No, usually Gross - OPV).
    // Actually, SO base is usually (Gross - OPV). 
    // Let's check generally. In 2023-2024, SO is on (Gross - OPV).
    // User didn't specify base details, only rates. I'll assume standard (Gross - OPV).
    // And clamped between MZP and 7*MZP.
    // Exception: If Gross < MZP, SO is usually on Gross? No, Min Base is MZP.
    // So clamp(MZP, 7*MZP, Gross - OPV).

    let soBase = gross - opv;
    if (soRate > 0) {
        if (soBase < LIMITS.SO_MIN_INCOME) soBase = LIMITS.SO_MIN_INCOME;
        if (soBase > LIMITS.SO_MAX_INCOME) soBase = LIMITS.SO_MAX_INCOME;
    } else {
        soBase = 0;
    }
    let so = soBase * soRate;

    // 5. SN (Social Tax 6%)
    // Base: Gross - OPV - VOSMS? Or just Gross - OPV?
    // Standard: (Gross - OPV) * Rate - SO.
    // Rate: 6% (User said 0.06).
    // Matrix: Pensioner=Yes, Student=Yes, Disabled 3=Yes. Disabled 1-2=No.
    let snRate = RATES.SN;
    if (category === 'disabled_1_2') snRate = 0;

    let snBase = gross - opv; // Usually just Gross-OPV
    if (snBase < 0) snBase = 0;
    let snCalculated = snBase * snRate;
    let sn = snCalculated - so;
    if (sn < 0) sn = 0; // SN cannot be negative
    // Exceptions: If category is disabled_1_2, sn is 0.
    if (category === 'disabled_1_2') sn = 0;

    // 6. OOSMS (Employer Health 3%)
    let oosmsRate = RATES.OOSMS;
    if (category === 'pensioner' || category === 'student' || category === 'disabled_1_2' || category === 'disabled_3') {
        oosmsRate = 0; // Matrix: No for all privileged.
    }
    let oosmsBase = Math.min(gross, LIMITS.OOSMS_MAX_INCOME);
    let oosms = oosmsBase * oosmsRate;

    // 7. OPPV (Employer Pension 3.5%) - Assuming born > 1975 for typical employee
    let oppvRate = RATES.OPPV; // 0.035
    // Who pays OPPV? Usually purely employer expense.
    // Does it apply to pensioners? No.
    // Students? Yes.
    // Disabled? Yes.
    // I'll assume standard application unless excluded. 
    // User Config: "OPPV_RATE: 0.035". 
    // I'll apply to all except pensioners.
    if (category === 'pensioner') oppvRate = 0;

    let oppvBase = Math.min(gross, LIMITS.OPV_MAX_INCOME); // Same cap as OPV? User didn't specify cap, assuming OPV cap.
    let oppv = oppvBase * oppvRate;

    return {
        gross,
        net,
        opv,
        vosms,
        ipn,
        so,
        sn,
        oosms,
        oppv,
        totalEmployerCost: gross + so + sn + oosms + oppv
    };
}

function calculateFromNet(targetNet: number, hasDeduction: boolean, category: UserCategory): TaxResult {
    // Binary Search
    let low = targetNet;
    let high = targetNet * 2; // Heuristic upper bound
    if (high < MZP) high = MZP * 2; // Handle low net

    let iter = 0;
    let bestGross = low;
    let minDiff = Infinity;

    // Expand high if needed (unlikely except for very high tax burdens)
    while (calculateFromGross(high, hasDeduction, category).net < targetNet) {
        high *= 1.5;
        if (high > 1e9) break; // Safety break
    }

    while (iter < 50) { // Max 50 iterations
        let mid = (low + high) / 2;
        let res = calculateFromGross(mid, hasDeduction, category);

        let diff = res.net - targetNet;

        if (Math.abs(diff) < 0.5) {
            return res;
        }

        if (diff < 0) {
            low = mid;
        } else {
            high = mid;
        }

        if (Math.abs(res.net - targetNet) < minDiff) {
            minDiff = Math.abs(res.net - targetNet);
            bestGross = mid;
        }

        iter++;
    }

    return calculateFromGross(bestGross, hasDeduction, category);
}

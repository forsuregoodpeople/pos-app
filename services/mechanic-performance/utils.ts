export function calculatePerformanceScore(
    totalRevenue: number,
    transactionCount: number,
    avgTransactionValue: number,
    customerSatisfaction?: number
): number {
    let score = 50; // Base score

    // Revenue factor (30% of total score)
    if (totalRevenue > 10000000) score += 30;
    else if (totalRevenue > 5000000) score += 20;
    else if (totalRevenue > 1000000) score += 10;

    // Transaction count factor (20% of total score)
    if (transactionCount > 50) score += 20;
    else if (transactionCount > 20) score += 15;
    else if (transactionCount > 10) score += 10;

    // Average transaction value factor (20% of total score)
    if (avgTransactionValue > 1000000) score += 20;
    else if (avgTransactionValue > 500000) score += 15;
    else if (avgTransactionValue > 200000) score += 10;

    // Customer satisfaction factor (30% of total score)
    if (customerSatisfaction) {
        if (customerSatisfaction >= 4.5) score += 30;
        else if (customerSatisfaction >= 4.0) score += 25;
        else if (customerSatisfaction >= 3.5) score += 20;
        else if (customerSatisfaction >= 3.0) score += 15;
        else if (customerSatisfaction >= 2.5) score += 10;
        else if (customerSatisfaction >= 2.0) score += 5;
    }

    return Math.min(100, Math.max(0, score));
}

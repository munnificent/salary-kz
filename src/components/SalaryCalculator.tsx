import { useState, useEffect } from 'react';
import { Layout } from './Layout';
import { SalaryInput } from './SalaryInput';
import { SalaryOutput } from './SalaryOutput';
import { DistributionChart } from './DistributionChart';
import { calculateSalary, type CalculationInput, type TaxResult } from '@/lib/calculator';
import { useMediaQuery } from '@/hooks/use-media-query';

// Initial State
const initialState: CalculationInput = {
    amount: 0,
    mode: 'gross',
    hasDeduction: true,
    category: 'standard'
};

export function SalaryCalculator() {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [input, setInput] = useState<CalculationInput>(() => {
        // Load from localStorage
        const saved = localStorage.getItem('salary_input');
        return saved ? JSON.parse(saved) : initialState;
    });

    const [result, setResult] = useState<TaxResult | null>(null);

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('salary_input', JSON.stringify(input));

        // Calculate with debounce
        const timer = setTimeout(() => {
            if (input.amount >= 0) {
                setResult(calculateSalary(input));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [input]);

    return (
        <Layout>
            <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <SalaryInput value={input} onChange={setInput} />
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-7 space-y-6">
                    {result && (
                        <>
                            <SalaryOutput result={result} />

                            {isDesktop && (
                                <div className="hidden md:block">
                                    <h3 className="text-lg font-semibold mb-4 text-center">Структура выплат (Employee)</h3>
                                    <DistributionChart result={result} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sticky Footer for Mobile Net Result */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground mr-2">Итого на руки:</span>
                <span className="text-xl font-bold text-primary">
                    {result ? new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(result.net) : '0 ₸'}
                </span>
            </div>
        </Layout>
    );
}

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type TaxResult } from '@/lib/calculator';

interface DistributionChartProps {
    result: TaxResult;
}

export function DistributionChart({ result }: DistributionChartProps) {
    // Data for Employee Deductions
    const employeeData = [
        { name: 'На руки (Net)', value: result.net, color: '#10b981' }, // emerald-500
        { name: 'ОПВ', value: result.opv, color: '#f59e0b' }, // amber-500
        { name: 'IPN', value: result.ipn, color: '#3b82f6' }, // blue-500
        { name: 'VOSMS', value: result.vosms, color: '#ef4444' }, // red-500
    ].filter(item => item.value > 0);

    // Data for Employer Expenses (Separate chart or same? User said "Results breakdown + Pie Chart" singular)
    // Usually Pie Chart shows where the Gross goes.
    // Gross = Net + OPV + IPN + VOSMS.
    // Employer costs are on top.
    // I will show the breakdown of Gross Salary.

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={employeeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {employeeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT' }).format(Number(value))}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

import { type TaxResult } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalaryOutputProps {
    result: TaxResult;
}

export function SalaryOutput({ result }: SalaryOutputProps) {
    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('ru-KZ', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="space-y-6">
            {/* Employee Side */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Ваша зарплата</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Оклад (Gross)</span>
                            <span className="font-medium">{formatMoney(result.gross)}</span>
                        </div>

                        <div className="border-t my-2"></div>

                        <div className="flex justify-between text-amber-600">
                            <span>Пенсионные взносы (ОПВ)</span>
                            <span>-{formatMoney(result.opv)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span>Взносы ОСМС</span>
                            <span>-{formatMoney(result.vosms)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600">
                            <span>Подоходный налог (ИПН)</span>
                            <span>-{formatMoney(result.ipn)}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-lg">НА РУКИ (Net)</span>
                            <span className="font-bold text-3xl text-primary">{formatMoney(result.net)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employer Side */}
            <Card className="bg-muted/50 border-dashed">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-muted-foreground">Расходы работодателя</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Соц. отчисления (СО)</span>
                        <span>{formatMoney(result.so)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Соц. налог (СН)</span>
                        <span>{formatMoney(result.sn)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Отчисления ОСМС</span>
                        <span>{formatMoney(result.oosms)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>ОППВ (Работодатель)</span>
                        <span>{formatMoney(result.oppv)}</span>
                    </div>

                    <div className="pt-2 mt-2 border-t flex justify-between font-medium">
                        <span>Полные затраты</span>
                        <span>{formatMoney(result.totalEmployerCost)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

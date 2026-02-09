import React from 'react';
import { type CalculationInput, type UserCategory } from '@/lib/calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface SalaryInputProps {
    value: CalculationInput;
    onChange: (newValue: CalculationInput) => void;
}

export function SalaryInput({ value, onChange }: SalaryInputProps) {

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        onChange({ ...value, amount: isNaN(val) ? 0 : val });
    };

    const handleModeChange = (mode: string) => {
        onChange({ ...value, mode: mode as 'gross' | 'net' });
    };

    const handleCategoryChange = (category: UserCategory, checked: boolean) => {
        // If checking a category, set it. If unchecking, set to 'standard'.
        // Logic: Only one category active at a time vs multiple? 
        // User requested: Checkboxes for Pensioner, Disabled 1-2, Disabled 3, Student.
        // Logic: Is it possible to be Student AND Disabled? Yes.
        // But tax rules usually take the most beneficial exemption.
        // Code handling: My calculator assumes single category input `UserCategory`.
        // I will implement radio-like behavior for checkboxes or priority.
        // If I select 'Pensioner', it overrides others.
        // I'll effectively make them mutually exclusive mostly or just set the last checked one.
        // Or better: Use an Accordion for "Status" where you select one.
        // User asked for "Accordions or List" and "Checkbox: ...".

        if (checked) {
            onChange({ ...value, category });
        } else {
            if (value.category === category) {
                onChange({ ...value, category: 'standard' });
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Параметры расчета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Mode Selection */}
                <div className="space-y-2">
                    <Label>Режим расчета</Label>
                    <Tabs value={value.mode} onValueChange={handleModeChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="gross">От оклада (Gross)</TabsTrigger>
                            <TabsTrigger value="net">На руки (Net)</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <Label>Сумма (₸)</Label>
                    <Input
                        type="number"
                        min="0"
                        value={value.amount || ''}
                        onChange={handleAmountChange}
                        placeholder="Введите сумму"
                        className="text-lg"
                    />
                    {value.amount > 0 && value.amount < 85000 && (
                        <p className="text-sm text-amber-600 font-medium">⚠️ Сумма ниже МЗП (85 000 ₸)</p>
                    )}
                </div>

                {/* Deduction Toggle */}
                <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="deduction" className="flex flex-col space-y-1">
                        <span>Вычет 14 МРП (Standard)</span>
                        <span className="font-normal text-xs text-muted-foreground">Уменьшает ИПН</span>
                    </Label>
                    <Switch
                        id="deduction"
                        checked={value.hasDeduction}
                        onCheckedChange={(checked) => onChange({ ...value, hasDeduction: checked })}
                    />
                </div>

                {/* Categories */}
                <div className="space-y-2">
                    <Label>Льготы и статус</Label>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1" className="border-b-0">
                            <AccordionTrigger className="py-2 text-sm hover:no-underline">
                                Выберите категорию (если применимо)
                            </AccordionTrigger>
                            <AccordionContent className="pt-2">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="pensioner"
                                            checked={value.category === 'pensioner'}
                                            onCheckedChange={(c) => handleCategoryChange('pensioner', c as boolean)}
                                        />
                                        <Label htmlFor="pensioner">Пенсионер</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="dis12"
                                            checked={value.category === 'disabled_1_2'}
                                            onCheckedChange={(c) => handleCategoryChange('disabled_1_2', c as boolean)}
                                        />
                                        <Label htmlFor="dis12">Инвалидность 1-2 группы</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="dis3"
                                            checked={value.category === 'disabled_3'}
                                            onCheckedChange={(c) => handleCategoryChange('disabled_3', c as boolean)}
                                        />
                                        <Label htmlFor="dis3">Инвалидность 3 группы</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="student"
                                            checked={value.category === 'student'}
                                            onCheckedChange={(c) => handleCategoryChange('student', c as boolean)}
                                        />
                                        <Label htmlFor="student">Студент (очная форма)</Label>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground pt-1">
                                        * Освобождение от ОСМС только при наличии справки из ВУЗа
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

            </CardContent>
        </Card>
    );
}

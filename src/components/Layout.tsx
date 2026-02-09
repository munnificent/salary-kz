import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center max-w-4xl mx-auto px-4">
                    <h1 className="font-bold text-lg hidden sm:block">KZ Salary Calculator 2026</h1>
                    <h1 className="font-bold text-lg sm:hidden">Зарплата РК 2026</h1>
                </div>
            </header>
            <main className="container max-w-4xl mx-auto px-4 py-6 sm:py-8">
                {children}
            </main>
            <footer className="border-t py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row max-w-4xl mx-auto text-sm text-muted-foreground text-center">
                    <p>
                        Based on Tax Code 2026 Draft params.
                    </p>
                    <p>
                        Built with React 19 + shadcn/ui.
                    </p>
                </div>
            </footer>
        </div>
    );
}

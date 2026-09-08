'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Link from 'next/link';
import Logo from '@/app/ui/esl-logo';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const links = [
    { label: 'About', href: '/about' },
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' }
];

export default function Nav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 md:py-8">
            <Link href="/" className="flex items-center gap-2 md:mr-[4rem]">
                <Logo />
            </Link>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-12">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="font-heading font-light text-marigold transition-colors hover:text-marigold-light"
                        >
                            {link.label}
                        </Link>
                ))}
            </nav>
            
            {/* Mobile Nav */}
            <div className="flex flex-col items-end absolute top-[15px] right-[15px] md:hidden">
                <button
                  type="button"
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="shrink w-11 rounded-md p-2 hover:bg-black hover:text-white md:hidden"
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isOpen}
                  aria-controls="mobile-menu"
                >
                    {isOpen ? <XMarkIcon className="w-7" /> : <Bars3Icon className="w-7" />}
                </button>

                <nav
                    id="mobile-menu"
                    className={clsx(
                    'overflow-hidden bg-white rounded-md transition-[max-height] duration-300 ease-in-out md:hidden',
                    isOpen ? 'max-h-96' : 'max-h-0',
                    )}
                >
                    <div className="flex flex-col gap-1 px-4 pb-4">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className={clsx(
                            'flex items-center gap-2 rounded-md p-3 text-sm font-light hover:bg-gray-100',
                            { 'bg-gray-100': isActive },
                            )}
                        >
                            {link.label}
                        </Link>
                        );
                    })}
                    </div>
                </nav>
            </div>
            

        </header>
    );
}
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with tailwind-merge to handle conflicts correctly
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

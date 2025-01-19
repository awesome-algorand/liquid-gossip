import React from 'react';
import { cn } from "@/lib/utils"

export interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement>{}
export const ListItem: React.FC<ListItemProps> = ({children, className}) => {
    return (
        <li
            className={cn(
                'flex items-center justify-between py-2 px-4 border rounded-lg rounded-md hover:bg-gray-100 dark:hover:bg-gray-900',
                className
            )}
        >
            {children}
        </li>
    );
};



type ListProps = {
    children: React.ReactNode;
    className?: string;
};

export const List: React.FC<ListProps> = ({children, className}) => {
    return (
        <ul
            className={cn(
                'list-none space-y-2 p-0',
                className
            )}
        >
            {children}
        </ul>
    );
};
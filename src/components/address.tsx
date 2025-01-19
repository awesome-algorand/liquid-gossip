import React from "react";
import type {VariantProps} from "class-variance-authority";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {List, ListItem} from "@/components/ui/list.tsx";


export type onClickHandler = (e:  React.MouseEvent<HTMLButtonElement, MouseEvent>, address: string)=> void

export interface AddressItemProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    address: string;
    label: string;
}
export const AddressItem: React.FC<AddressItemProps> = ({address, label, onClick}) => {
    return (
        <ListItem>
            <span className="text-sm font-medium truncate max-w-md">{address}</span>
            <Button
                data-address={address}
                onClick={onClick}
                variant="outline"
                className="ml-2"
            >
                {label}
            </Button>
        </ListItem>
    );
};


export interface AddressListProps {
    addresses: string[];
    label: string;
    onClick: onClickHandler
}

export const AddressList: React.FC<AddressListProps> = (props) => {
    const { addresses, label, onClick } = props
    return (
        <List>
            {addresses.map((address) => (
                <AddressItem key={address} label={label} address={address} onClick={(e)=>{
                    if (
                        !(e.target instanceof HTMLButtonElement) ||
                        typeof e.target.dataset.address === 'undefined'
                    ) {
                        return;
                    }
                    onClick(e, e.target.dataset.address)
                }}/>
            ))}
        </List>
    );
};
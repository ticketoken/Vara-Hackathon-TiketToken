import React, { createContext, useContext, useState } from "react";
import SailsCalls from "@/app/SailsCalls";

interface Props {
    children: JSX.Element
}

interface SailsContextI {
    sails: SailsCalls | null,
    setSails:  React.Dispatch<React.SetStateAction<SailsCalls | null>> | null
}

export const sailsContext = createContext<SailsContextI>({
    sails: null,
    setSails: null
});

export const SailsProvider = ({ children }: Props) => {
    const [sails, setSails] = useState<SailsCalls | null>(null);

    return (
        <sailsContext.Provider
            value={{
                sails,
                setSails
            }}
        >
            { children }
        </sailsContext.Provider>
    );
}

export const useSailsContext = () => {
    const {
        sails,
        setSails
    } = useContext(sailsContext);

    return {
        sails,
        setSails: setSails as React.Dispatch<React.SetStateAction<SailsCalls | null>>
    };
}
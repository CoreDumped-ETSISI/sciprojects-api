import React from "react";
import { Navigation } from "../components/Navigation";
import { CreateGroup } from "../components/CreateGroup";

import { useParams } from "react-router-dom";

export function CreateGroupPage() {
    const { id } = useParams();

    return (
        <div>
            <Navigation />
            {id ? (
                
                <CreateGroup id={id} />
                
            ) : (
                <>
                <CreateGroup />
                </>
            )}
        </div>
    );
}


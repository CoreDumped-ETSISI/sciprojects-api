import React from "react";
import { Navigation } from "../components/Navigation";
import { CreateGroup } from "../components/CreateGroup";

export function CreateGroupPage() {
    return (
        <div>
            <Navigation />
            <h1>Create Group</h1>
            <CreateGroup />
        </div>
    );
}


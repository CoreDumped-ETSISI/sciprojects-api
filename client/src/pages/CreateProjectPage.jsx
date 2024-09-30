import React from "react";
import { Navigation } from "../components/Navigation";
import { CreateProject } from "../components/CreateProject";

export function CreateProjectPage() {
    return (
        <div>
            <Navigation />
            <h1>Create Project</h1>
            <CreateProject />
        </div>
    );
}

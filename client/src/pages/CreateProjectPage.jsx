import React from "react";
import { Navigation } from "../components/Navigation";
import { CreateProject } from "../components/CreateProject";
import { useParams } from "react-router-dom";

export function CreateProjectPage() {
    const { id } = useParams();

    return (
        <div>
            <Navigation />
            {id ? (
                <CreateProject id={id} />
            ) : (
                <>
                <CreateProject />
                </>
            )}
        </div>
    );
}

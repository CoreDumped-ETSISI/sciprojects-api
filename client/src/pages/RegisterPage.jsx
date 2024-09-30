import React from "react";
import {Register} from "../components/Register";
import { Navigation } from "../components/Navigation";

export function RegisterPage() {

    return (
        <div>
            <Navigation />
            <h1>Registro</h1>
            <Register />
        </div>
    );
}

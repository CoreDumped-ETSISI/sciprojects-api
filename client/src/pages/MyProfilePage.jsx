import React from "react";
import { MyProfile } from "../components/MyProfile";
import { Navigation } from "../components/Navigation";

export function MyProfilePage() {
    return (
        <div>
            <Navigation />
            <h1>Mi Perfil</h1>
            <MyProfile />
        </div>
    );
}

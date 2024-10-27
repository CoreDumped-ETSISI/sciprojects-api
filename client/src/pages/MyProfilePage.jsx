import React from "react";
import { MyProfile } from "../components/MyProfile";
import { Navigation } from "../components/Navigation";

export function MyProfilePage() {
    return (
        <div>
            <Navigation />
            <MyProfile />
        </div>
    );
}

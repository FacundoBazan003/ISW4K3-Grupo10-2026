import { createBrowserRouter, Navigate } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                index: true,
                Component: HomePage,
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);


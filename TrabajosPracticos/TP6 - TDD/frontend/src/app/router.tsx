import { createBrowserRouter, Navigate } from "react-router";

import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import InscriptionPage from "@/pages/inscription/InscriptionPage";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
        children: [
            {
                index: true,
                Component: HomePage,
            },
            {
                path: "inscribirme",
                element: (
                    <ProtectedRoute>
                        <InscriptionPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "inscribirme/:activityId",
                element: (
                    <ProtectedRoute>
                        <InscriptionPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "login",
                element: (
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                ),
            },
        ],
    },
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);


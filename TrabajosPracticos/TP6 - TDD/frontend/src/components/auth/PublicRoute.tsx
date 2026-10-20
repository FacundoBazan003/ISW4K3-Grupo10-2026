import { Navigate } from "react-router";
import { useAuthStore } from "@/store/authStore";

interface PublicRouteProps {
    children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}

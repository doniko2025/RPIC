/**
 * Hook useAuth — wrapper du contexte d'authentification
 * Utilisé dans tous les composants protégés.
 *
 * Usage :
 *   const { user, isLoading, logout } = useAuth();
 *   if (isLoading) return <Spinner />;
 *   if (!user) redirect("/login");
 */
"use client";
export { useAuth } from "@/lib/auth-context";

import { createFileRoute, Outlet } from '@tanstack/react-router';
export const Route = createFileRoute('/clan/$clanId')({ component: () => <Outlet /> });

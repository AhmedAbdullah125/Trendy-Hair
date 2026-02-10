import { useEffect, useRef } from 'react';
import { adminRefreshToken } from '../components/requests/adminRefreshToken';

/**
 * Hook to automatically refresh admin token before expiration
 * Refreshes token 5 minutes before the 1-year expiration
 */
export const useAdminTokenRefresh = () => {
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const adminToken = localStorage.getItem('admin_token');

        if (!adminToken) {
            return;
        }

        // Token expires in 1 year (31536000 seconds)
        // Refresh every 11 months to be safe
        const REFRESH_INTERVAL = 1000 * 60 * 60 * 24 * 30 * 11; // 11 months in milliseconds

        const refreshTokenPeriodically = async () => {
            // const result = await adminRefreshToken(() => { }, 'ar');

            // if (!result.success) {
            //     console.error('Failed to refresh admin token');
            //     // Clear invalid tokens
            //     localStorage.removeItem('admin_token');
            //     localStorage.removeItem('admin_refresh_token');
            //     localStorage.removeItem('admin_user');
            //     localStorage.removeItem('admin_permissions');
            //     // Redirect to login
            //     window.location.href = '/admin/login';
            // }
        };

        // Set up periodic refresh
        refreshIntervalRef.current = setInterval(refreshTokenPeriodically, REFRESH_INTERVAL);

        // Clean up interval on unmount
        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, []);
};

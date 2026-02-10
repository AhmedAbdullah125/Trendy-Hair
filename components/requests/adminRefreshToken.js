import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

export async function adminRefreshToken(setLoading, lang) {
    setLoading(true);
    const url = `${API_BASE_URL}/v1/admin/auth/refresh-token`;
    const formData = new FormData();
    const refresh_token = localStorage.getItem("admin_refresh_token");

    formData.append('grant_type', "refresh_token");
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', "a10c4102-9d0e-40ff-a301-8de8881779ac");
    formData.append('client_secret', "SG1aNaO9BTemG8rPWHEYAxydiYQTcE1fZWBeSu5N");
    const headers = { 'lang': lang };

    try {
        const response = await axios.post(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false);
        if (response.data.status) {
            // Extract token and admin from the response structure
            const tokenData = response.data.items.token;
            const adminData = response.data.items.admin;

            // Update admin tokens
            localStorage.setItem("admin_token", tokenData.access_token);
            localStorage.setItem("admin_refresh_token", tokenData.refresh_token);
            localStorage.setItem("admin_user", JSON.stringify(adminData));
            localStorage.setItem("admin_permissions", JSON.stringify(response?.data?.items?.permissions || []));

            return { success: true }; // Indicate success
        } else {
            toast(message, {
                style: {
                    background: "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
            return { success: false };
        }
    } catch (error) {
        setLoading(false);
        const errorMessage = error?.response?.data?.message || error.message;
        toast(errorMessage, {
            style: {
                background: "#dc3545",
                color: "#fff",
                borderRadius: "10px",
                boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
            },
        });
        return { success: false, error: errorMessage };
    }
}

import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

export async function refreshToken(setLoading, lang) {
    setLoading(true)
    const url = `${API_BASE_URL}/v1/refresh-token`;
    const formData = new FormData();
    const refresh_token = localStorage.getItem("refresh_token");
    formData.append('grant_type', "refresh_token");
    formData.append('refresh_token', refresh_token);
    formData.append('client_id', "a0e57322-f1ef-4a3c-84ff-b9a3d852a559");
    formData.append('client_secret', "OF3II6JtC3DIrSk5mNVl0ZaPlkP1P8nI5wrf1tYX");
    const headers = { 'lang': lang }
    try {
        const response = await axios.post(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
            // Extract token and user from the new response structure
            const tokenData = response.data.items.token;
            const userData = response.data.items.user;

            toast(message, {
                style: {
                    background: "#1B8354",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });

            // Update access_token and refresh_token
            localStorage.setItem("token", tokenData.access_token);
            localStorage.setItem("refresh_token", tokenData.refresh_token);

            // Update user data
            localStorage.setItem("userId", userData.id);
            localStorage.setItem("user", JSON.stringify(userData));

            // Update cookie with new access_token
            document.cookie = `token=${encodeURIComponent(tokenData.access_token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

            return true; // Indicate success
        }
        else {
            toast(message, {
                style: {
                    background: "#dc3545",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
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
    }
}
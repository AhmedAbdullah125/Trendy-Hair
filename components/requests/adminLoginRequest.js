import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

export async function adminLoginRequest(data, setLoading, lang) {
    setLoading(true);
    const url = `${API_BASE_URL}/v1/admin/auth/login`;
    const formData = new FormData();
    formData.append('phone', data.phone);
    formData.append('password', data.password);
    formData.append('client_id', "a10c4102-9d0e-40ff-a301-8de8881779ac");
    formData.append('client_secret', "SG1aNaO9BTemG8rPWHEYAxydiYQTcE1fZWBeSu5N");
    formData.append('grant_type', "password");
    const headers = { 'lang': lang };

    try {
        const response = await axios.post(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false);
        if (response.data.status) {
            // Extract token and admin from the response structure
            const tokenData = response?.data?.items?.token;
            const adminData = response?.data?.items?.admin;

            if (tokenData) {
                toast(message, {
                    style: {
                        background: "#1B8354",
                        color: "#fff",
                        borderRadius: "10px",
                        boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                    },
                    description: `مرحباً ${adminData?.name || ""}`
                });

                // Store admin tokens separately from customer tokens
                localStorage.setItem("admin_token", tokenData.access_token);
                localStorage.setItem("admin_refresh_token", tokenData.refresh_token);
                localStorage.setItem("admin_user", JSON.stringify(adminData));
                localStorage.setItem("admin_permissions", JSON.stringify(response?.data?.items?.permissions || []));

                return { success: true, admin: adminData };
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

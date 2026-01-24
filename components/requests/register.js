import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';

export async function registerRequest(data, setLoading, lang, router) {
    setLoading(true)
    const url = `${API_BASE_URL}/register`;
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone.split("+").join(""));
    formData.append('password', data.password);
    formData.append('grant_type', "password");
    formData.append('client_id', "a0e57322-f1ef-4a3c-84ff-b9a3d852a559");
    formData.append('client_secret', "OF3II6JtC3DIrSk5mNVl0ZaPlkP1P8nI5wrf1tYX");
    const headers = { 'lang': lang }
    try {
        const response = await axios.post(url, formData, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
            const tokenData = response?.data?.items?.token;
            const userData = response?.data?.items?.user;
            if (response?.data?.items?.token) {

                toast(message, {
                    style: {
                        background: "#1B8354",
                        color: "#fff",
                        borderRadius: "10px",
                        boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                    },

                    description: `مرحباً ${response?.data?.items?.token ? userData?.name : ""}`
                });
                localStorage.setItem("token", tokenData?.access_token);
                localStorage.setItem("refresh_token", tokenData?.refresh_token);
                localStorage.setItem("userId", userData?.id);
                document.cookie = `token=${encodeURIComponent(tokenData.access_token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;

                router.push("/");
                localStorage.setItem("user", JSON.stringify(userData));
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
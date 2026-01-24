import axios from 'axios';
import { API_BASE_URL } from '@/lib/apiConfig';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
export async function toggleFavourite(id, setLoading, lang) {
    setLoading(true)
    const url = `${API_BASE_URL}/products/toggle-favorite/${id}`;
    const headers = { 'lang': lang }
    const token = Cookies.get("token");
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
        const response = await axios.post(url, {}, { headers });
        const message = response?.data?.message;

        setLoading(false)
        if (response.data.status) {
            toast(message, {
                style: {
                    background: "#1B8354",
                    color: "#fff",
                    borderRadius: "10px",
                    boxShadow: "5px 5px 10px rgba(0, 0, 0, 0.1)",
                },
            });
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
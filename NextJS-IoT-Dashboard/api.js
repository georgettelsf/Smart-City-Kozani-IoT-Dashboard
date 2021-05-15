import axios from 'axios'
import { logOut } from './auth'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(response => response, error => {
    if (error.response.status === 401) {
        logOut()

        return Promise.reject()
    }

    return Promise.reject(error)
})

export default api;
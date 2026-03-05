import axios from 'axios';

const client = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Profile
    getProfile: () => client.get('/profile/'),
    updateProfile: (data) => client.put('/profile/', data),

    // Chat
    sendMessage: (message) => client.post('/chat/', { message }),
    getChatHistory: () => client.get('/chat/history'),
    clearChatHistory: () => client.delete('/chat/history'),

    // Workouts
    createWorkout: (data) => client.post('/workouts/', data),
    getWorkouts: (limit = 20) => client.get(`/workouts/?limit=${limit}`),
    deleteWorkout: (id) => client.delete(`/workouts/${id}`),

    // Meals
    createMeal: (data) => client.post('/meals/', data),
    getMeals: (days = 7) => client.get(`/meals/?days=${days}`),
    deleteMeal: (id) => client.delete(`/meals/${id}`),

    // Dashboard
    getDashboardStats: () => client.get('/dashboard/'),

    // Plans
    generatePlan: (data) => client.post('/plans/generate', data),
    getPlans: () => client.get('/plans/'),
    activatePlan: (id) => client.patch(`/plans/${id}/activate`),
    deletePlan: (id) => client.delete(`/plans/${id}`),
};

export default client;

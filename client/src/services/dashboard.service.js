import { apiRequest } from "./api"

// Get summary content for dashboard
export const DashboardSummary = async() => {
    try {
        const response = await apiRequest("/dashboard/summary", {
            method: 'GET'
        })
        if (!response.ok) {
            console.log("Failed to fetch summary items")
        }
        return response?.count || null
    } catch (error) {
        console.error(error)
    }
}
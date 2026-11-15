import { apiRequest } from "./api";
import { getProducts } from "./inventory.service";
import { getStockStatus } from "@/data/inventory";

// fetch dashboard summary counters and sync low-stock count with inventory logic
export const DashboardSummary = async () => {
    try {
        const [summaryRes, productsRes] = await Promise.allSettled([
            apiRequest("/dashboard/summary", { method: "GET" }),
            getProducts(),
        ]);

        const count =
            summaryRes.status === "fulfilled" ? (summaryRes.value?.count ?? {}) : {};

        if (productsRes.status === "fulfilled" && Array.isArray(productsRes.value)) {
            const lowStockCount = productsRes.value.filter(
                (p) => getStockStatus(p) === "low" || getStockStatus(p) === "out"
            ).length;
            return {
                orders: count.orders ?? 0,
                customers: count.customers ?? 0,
                inventory: lowStockCount,
            };
        }

        return count;
    } catch (error) {
        console.error(error);
        return null;
    }
};

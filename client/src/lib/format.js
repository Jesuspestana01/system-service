// Utilidades de formato compartidas por las vistas
const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

// Recibe fechas en formato ISO "YYYY-MM-DD" o timestamp ISO completo
export const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    const date = isoDate.includes("T") ? new Date(isoDate) : new Date(`${isoDate}T00:00:00Z`);
    return date.toLocaleDateString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
};

export const formatDateTime = (isoDateTime) => {
    if (!isoDateTime) return "—";
    return new Date(isoDateTime).toLocaleString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const nowISO = () => new Date().toISOString();

export const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");

export const clampPercent = (value) => Math.min(100, Math.max(0, Number(value) || 0));

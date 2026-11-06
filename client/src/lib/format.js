// utilidades de formato compartidas por las vistas

const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

// recibe fechas en formato ISO "YYYY-MM-DD"
export const formatDate = (isoDate) => {
    if (!isoDate) return "—";
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString("es", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// fecha local de hoy en formato "YYYY-MM-DD"
export const todayISO = () => new Date().toLocaleDateString("en-CA");

export const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join("");

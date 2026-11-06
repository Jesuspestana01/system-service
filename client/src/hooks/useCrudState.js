import { useState } from "react";

/**
 * Maneja en memoria el estado típico de una vista CRUD:
 * lista de elementos, diálogo de formulario (crear/editar) y confirmación de eliminación.
 *
 * TODO: cuando el backend esté listo, reemplazar las operaciones locales por llamadas a la API.
 *
 * @param {Array} initialItems - Datos iniciales.
 * @param {(items: Array) => string} createId - Genera el id de un nuevo elemento.
 */
export function useCrudState(initialItems, createId) {
    const [items, setItems] = useState(initialItems);
    const [form, setForm] = useState({ open: false, item: null });
    const [itemToDelete, setItemToDelete] = useState(null);

    const openCreate = () => setForm({ open: true, item: null });
    const openEdit = (item) => setForm({ open: true, item });
    // se conserva `item` al cerrar para que el contenido no cambie durante la animación
    const setFormOpen = (open) => setForm((prev) => ({ ...prev, open }));

    const update = (id, data) =>
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));

    const save = (data) => {
        if (form.item) {
            update(form.item.id, data);
        } else {
            setItems((prev) => [{ ...data, id: createId(prev) }, ...prev]);
        }
        setFormOpen(false);
    };

    const confirmDelete = () => {
        if (!itemToDelete) return;
        setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
        setItemToDelete(null);
    };

    return {
        items,
        form,
        openCreate,
        openEdit,
        setFormOpen,
        save,
        update,
        itemToDelete,
        requestDelete: setItemToDelete,
        cancelDelete: () => setItemToDelete(null),
        confirmDelete,
    };
}

// genera ids secuenciales con prefijo
export const nextId = (items, prefix, digits = 3) => {
    const max = items.reduce((acc, item) => {
        const number = parseInt(String(item.id).split("-")[1], 10);
        return Number.isNaN(number) ? acc : Math.max(acc, number);
    }, 0);
    return `${prefix}-${String(max + 1).padStart(digits, "0")}`;
};

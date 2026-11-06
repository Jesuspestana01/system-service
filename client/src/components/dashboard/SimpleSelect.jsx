import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const normalize = (options) =>
    options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));

/**
 * Select simplificado.
 * `options` puede ser un arreglo de strings o de objetos { value, label }.
 * Acepta las props del Select de Shadcn: value, defaultValue, onValueChange, name, etc.
 */
export function SimpleSelect({ options, id, className, ...props }) {
    const items = normalize(options);

    return (
        <Select items={items} {...props}>
            <SelectTrigger id={id} className={cn("w-full", className)}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

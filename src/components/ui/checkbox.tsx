import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = e.target.checked;
      onCheckedChange?.(isChecked);
      onChange?.(e);
    };

    return (
      <input
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={handleChange}
        className={cn(
          "h-4 w-4 rounded border border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox }

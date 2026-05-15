import { useState, useTransition } from "react";
import { ZodSchema } from "zod";
import updateDeep from "@/lib/updateDeep";
import type { DateRangeValue } from "@/types/ui";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface UseFormManagerProps<T> {
  initialData: T;
  schema?: ZodSchema<T>;
  onSubmit?: (data: T, resetForm: () => void) => void | Promise<void>;
  searchFields?: string[];
}

const useFormManager = <T extends object>({
  initialData,
  schema,
  onSubmit,
  searchFields = [],
}: UseFormManagerProps<T>) => {

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<T>(() => {
    if (!searchFields.length) return initialData;
    const overrides = Object.fromEntries(
      searchFields
        .filter((f) => searchParams.has(f))
        .map((f) => [f, searchParams.get(f)])
    );
    return { ...initialData, ...overrides } as T;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const updateSearchParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const validate = (): boolean => {
    if (!schema) return true;

    const result = schema.safeParse(formData);
    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        formattedErrors[issue.path.join(".")] = issue.message;
      });
      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    customValue?: unknown,
  ) => {
    const { name, value, type } = e.target;
    const finalValue = customValue || type === "number" ? +value : value;

    if (searchFields.includes(name)) {
      updateSearchParam(name, String(finalValue));
    }

    setFormData((prev) => {
      if (name.includes(".")) {
        return updateDeep(prev, name.split("."), finalValue) as T;
      }
      return { ...prev, [name]: finalValue } as T;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData(initialData);
    setErrors({});
  };

  const handleToggle = (name: string) => (value: boolean | string | DateRangeValue) => {
    if (searchFields.includes(name)) {
      updateSearchParam(name, String(value));
    }
    setFormData((prev) => ({ ...prev, [name]: value }) as T);
  };

  const handleFieldChange = ({
    name,
    value,
  }: {
    name: string;
    value: unknown;
  }) => {
    if (searchFields.includes(name)) {
      updateSearchParam(name, String(value));
    }
    setFormData((prev) => {
      if (name.includes(".")) {
        return updateDeep(prev, name.split("."), value) as T;
      }
      return { ...prev, [name]: value } as T;
    });
  };

  const handleChangeMultiInputs = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }) as T);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate() || !onSubmit) return;
    startTransition(() => {
      Promise.resolve(onSubmit(formData, resetForm));
    });
  };

  return {
    formData,
    setFormData,
    handleChange,
    resetForm,
    validate,
    errors,
    handleToggle,
    handleFieldChange,
    handleChangeMultiInputs,
    setErrors,
    handleSubmit,
    loading: isPending,
  };
};

export default useFormManager;

import { useState, useTransition } from "react";
import { ZodSchema } from "zod";
import updateDeep from "@/lib/updateDeep";
import type { DateRangeValue } from "@/types/ui";

interface UseFormManagerProps<T> {
  initialData: T;
  schema?: ZodSchema<T>;
  onSubmit?: (data: T, resetForm: () => void) => void | Promise<void>;
}

type FormState<T> = T & { searchQuery: { search: string; value: string } };

const useFormManager = <T extends object>({
  initialData,
  schema,
  onSubmit,
}: UseFormManagerProps<T>) => {

  const [formData, setFormData] = useState<FormState<T>>({
    searchQuery: {
      search: "",
      value: "",
    },
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

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

    setFormData((prev) => {
      if (name.includes(".")) {
        return updateDeep(prev, name.split("."), finalValue) as FormState<T>;
      }
      return { ...prev, [name]: finalValue } as FormState<T>;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      searchQuery: { search: "", value: "" },
      ...initialData,
    });
    setErrors({});
  };

  const handleToggle = (name: string) => (value: boolean | string | DateRangeValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }) as FormState<T>);
  };

  const handleFieldChange = ({
    name,
    value,
  }: {
    name: string;
    value: unknown;
  }) => {
    setFormData((prev) => {
      if (name.includes(".")) {
        return updateDeep(prev, name.split("."), value) as FormState<T>;
      }
      return { ...prev, [name]: value } as FormState<T>;
    });
  };

  const handleChangeMultiInputs = (data: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, ...data }) as FormState<T>);
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

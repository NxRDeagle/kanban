export interface TaskFormValues {
  title: string;
  description: string | null;
}

export interface TaskFormProps {
  mode: "create" | "edit";
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => void;
  onCancel: VoidFunction;
  isSubmitting?: boolean;
}

export interface BoardFormValues {
  title: string;
  description: string | null;
}

export interface BoardFormProps {
  mode: "create" | "edit";
  initialValues?: BoardFormValues;
  onSubmit: (values: BoardFormValues) => void;
  onCancel: VoidFunction;
  isSubmitting?: boolean;
}

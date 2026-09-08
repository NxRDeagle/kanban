export interface ColumnFormValues {
  title: string;
}

export interface ColumnFormProps {
  mode: "create" | "edit";
  initialValues?: ColumnFormValues;
  onSubmit: (values: ColumnFormValues) => void;
  onCancel: VoidFunction;
  isSubmitting?: boolean;
}

export const CLASS_PREFIX = "toast";

export const classNames = {
  host: `${CLASS_PREFIX}-host`,
  root: CLASS_PREFIX,
  variant: (variant: string) => `${CLASS_PREFIX}-${variant}`,
  message: `${CLASS_PREFIX}-message`,
  dismiss: `${CLASS_PREFIX}-dismiss`,
};

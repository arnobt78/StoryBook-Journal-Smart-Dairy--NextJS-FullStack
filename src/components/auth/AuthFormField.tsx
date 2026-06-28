import type { ReactNode } from "react";
import { fieldLabelStyle } from "@/lib/auth-form-styles";
import { authStaggerRowProps } from "@/lib/auth-stagger";

type AuthFormFieldProps = {
  label: string;
  /** Stagger index for the label row */
  labelIndex: number;
  /** Stagger index for the input row */
  inputIndex: number;
  children: ReactNode;
};

/**
 * Auth form field — label and input are separate stagger rows for sync stair animation.
 */
export function AuthFormField({
  label,
  labelIndex,
  inputIndex,
  children,
}: AuthFormFieldProps) {
  return (
    <>
      <label {...authStaggerRowProps(labelIndex, { style: fieldLabelStyle })}>
        {label}
      </label>
      <div
        {...authStaggerRowProps(inputIndex, {
          className: "auth-field",
          style: { marginBottom: "12px" },
        })}
      >
        {children}
      </div>
    </>
  );
}

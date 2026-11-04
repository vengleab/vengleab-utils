declare module 'react-text-mask' {
  import type React from 'react';
  interface Props {
    mask: (value: string) => (string | RegExp)[];
    guide?: boolean;
    value?: string | number;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    render?: (ref: React.Ref<HTMLInputElement>, props: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactNode;
  }
  const MaskedInput: React.ComponentType<Props>;
  export default MaskedInput;
}

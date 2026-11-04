import React from 'react';
import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
const _noop = () => {};

type NumberMaskOptions = { prefix?: string; suffix?: string; allowDecimal?: boolean; [key: string]: unknown };
type InputMaskProps = { mask?: NumberMaskOptions; onChange?: (value: number) => void; value?: string | number; className?: string; placeholder?: string };

const InputMast = ({
  mask = {}, onChange = _noop, value, ...props
}: InputMaskProps) => {
  const { suffix = '', prefix = '' } = mask;

  const numberMask = createNumberMask({
    prefix,
    suffix,
    includeThousandsSeparator: true,
    thousandsSeparatorSymbol: ',',
    allowDecimal: mask.allowDecimal !== undefined ? mask.allowDecimal : true,
    decimalSymbol: '.',
    decimalLimit: 2,
    integerLimit: 12,
    allowNegative: false,
    allowLeadingZeroes: false,
    ...mask,
  });

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value: rawValue = '' } = e.target;

    // Extract numeric value by removing prefix, suffix and commas
    let cleanValue = rawValue;

    if (prefix && cleanValue.startsWith(prefix)) {
      cleanValue = cleanValue.substring(prefix.length);
    }
    if (suffix && cleanValue.endsWith(suffix)) {
      cleanValue = cleanValue.substring(0, cleanValue.length - suffix.length);
    }

    cleanValue = cleanValue.replaceAll(',', '');

    const floatValue = parseFloat(cleanValue);
    onChange(Number.isNaN(floatValue) ? 0 : floatValue);
  }

  return (
    <MaskedInput
      mask={numberMask}
      guide={false}
      onChange={handleInputChange}
      value={value}
      render={(ref: React.Ref<HTMLInputElement>, maskedProps: React.InputHTMLAttributes<HTMLInputElement>) => (
        <input
          ref={ref}
          {...maskedProps}
          placeholder={props.placeholder}
          className={`${props.className
            || ''} outline-none border-none focus:ring-0 focus:outline-none`}
        />
      )}
    />
  );
};

export default InputMast;

import { NumericFormat } from 'react-number-format';

type NumberMaskOptions = { prefix?: string; suffix?: string; allowDecimal?: boolean };
type InputMaskProps = {
  mask?: NumberMaskOptions;
  onChange?: (value: number) => void;
  value?: string | number;
  className?: string;
  placeholder?: string;
};

export default function InputMask({ mask = {}, onChange, value, className = '', placeholder }: InputMaskProps) {
  return (
    <NumericFormat
      value={value}
      prefix={mask.prefix ?? ''}
      suffix={mask.suffix ?? ''}
      thousandSeparator=","
      decimalScale={mask.allowDecimal === false ? 0 : 2}
      allowNegative={false}
      allowLeadingZeros={false}
      isAllowed={({ value: numericValue }) => numericValue.split('.')[0].length <= 12}
      onValueChange={({ floatValue }, sourceInfo) => {
        if (sourceInfo.source === 'event') onChange?.(floatValue ?? 0);
      }}
      placeholder={placeholder}
      className={`${className} outline-none border-none focus:ring-0 focus:outline-none`}
    />
  );
}

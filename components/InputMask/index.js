import MaskedInput from 'react-text-mask';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { Input } from 'semantic-ui-react';
import _noop from 'lodash/noop';

const InputMast = ({ mask = {}, onChange = _noop, ...props }) => {
  const { suffix = '', prefix = '' } = mask;
  function handleInputChange(_, e) {
    const { value = '' } = e;
    const floatValue = parseFloat(value.substring(prefix.length, value.length - suffix.length).replaceAll(',', ''));
    onChange(floatValue);
  }

  return (
    <Input
      onChange={handleInputChange}
      input={(e, inputProps) => (
        <MaskedInput mask={createNumberMask(mask)} guide={true} {...inputProps} />
      )}
      {...props}
    />
  );
};

export default InputMast;

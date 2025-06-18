export const dataValid = (value) => /^[a-zA-Z\s]+$/.test(value);

export const formatterRupiah = (value) => {
    if (!value) return '';
    const parts = value.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] ? ',' + parts[1] : '';
    return `Rp ${integerPart}${decimalPart}`;
};

export const parserRupiah = (value) => {
    if (!value) return '';
    return value
        .replace(/Rp\s?|\./g, '')
        .replace(',', '.');
}

export const formatterDiskon = (value) => {
    if (value === undefined || value === null) return '';
    const parts = value.toString().split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decimalPart = parts[1] ? ',' + parts[1] : '';
    return `${integerPart}${decimalPart}`;
};

export const parserDiskon = (value) => {
    if (!value) return '';
    return value
        .replace(/\./g, '')
        .replace(',', '.');
};

export const inputNumberProps = {
    className: 'w-100',
    formatter: formatterRupiah,
    parser: parserRupiah,
    min: 0,
    step: 0.01
}

  const defaultFilterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
 export const selectCommonProps = {
    showSearch: true,
    style: { textAlign: 'left' },
    optionFilterProp: 'label',
    filterOption: defaultFilterOption,
  };

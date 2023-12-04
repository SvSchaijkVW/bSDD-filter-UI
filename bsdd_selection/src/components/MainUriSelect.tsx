import { useState } from 'react';
import { Combobox, InputBase, Input, useCombobox } from '@mantine/core';

const groceries = [
    'https://identifier.buildingsmart.org/uri/digibase/bim-basis-objecten',
    'https://identifier.buildingsmart.org/uri/heijmans/bim-basis-objecten'
];

export function MainUriSelect() {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [value, setValue] = useState<string | null>(null);

    const options = groceries.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                setValue(val);
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    rightSectionPointerEvents="none"
                >
                    {value || <Input.Placeholder>Kies hoofddomein</Input.Placeholder>}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
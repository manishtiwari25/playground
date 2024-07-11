import { Select, SelectItem } from "@nextui-org/react";

import { siteConfig } from "@/config/site";

const TOKENIZER_OPTIONS = Object.freeze(siteConfig.models);

export const ChangeModel = ({
  onModelChange,
  selected,
}: {
  onModelChange: any;
  selected: string;
}) => {
  return (
    <Select
      className="max-w-xs dark:text-white"
      defaultSelectedKeys={[selected]}
      label="Change Model"
      onChange={onModelChange}
    >
      {Object.entries(TOKENIZER_OPTIONS).map(([value, label]) => (
        <SelectItem key={value} className="dark:text-white" value={value}>
          {String(label)}
        </SelectItem>
      ))}
    </Select>
  );
};

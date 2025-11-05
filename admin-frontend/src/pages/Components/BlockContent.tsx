import { Checkbox, InputContainer, LabelBlock, Separator, Tag, SortIcon } from '../../components/commons';

/**
 * Componente para mostrar el contenido de Block
 * @returns Componente BlockContent
 */
export const BlockContent = () => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Input Container con Sort Icon */}
      <InputContainer
        label="Label"
        rightIcon={<SortIcon color="#6B7280" />}
        className="bg-gray-100 border border-gray-200 rounded-lg"
      />

      {/* Primer Checkbox */}
      <Checkbox className="border-gray-300" />

      {/* Label Block con dos líneas y separador */}
      <div className="flex flex-col">
        <LabelBlock
          primaryLabel="Label"
          secondaryLabel="Label"
          rightIcon={<SortIcon color="#6B7280" />}
          className="py-2"
        />
        <Separator className="my-2 border-gray-200" />
      </div>

      {/* Segundo Checkbox */}
      <Checkbox className="border-gray-300" />

      {/* Tag verde */}
      <div className="flex items-start">
        <Tag className="bg-green-100 text-green-700">
          Label
        </Tag>
      </div>
    </div>
  );
};


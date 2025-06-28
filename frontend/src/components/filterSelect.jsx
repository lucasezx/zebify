import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

const options = [
  { id: "todos", label: "Todos" },
  { id: "amigos", label: "Amigos" },
  { id: "pendente", label: "Pedidos enviados" },
  { id: "recebido", label: "Solicitações recebidas" },
];

export default function FilterSelect({ value, onChange }) {
  return (
    <Listbox value={value} onChange={() => {}}>
      <div className="relative w-full sm:w-auto sm:min-w-[14rem]">
        <ListboxButton
          className="flex w-full items-center justify-between rounded-full
                     border border-gray-300 bg-white py-2 pl-4 pr-10
                     shadow-sm focus:outline-none focus:ring-2
                     focus:ring-blue-500"
        >
          {options.find((o) => o.id === value)?.label}
          <svg
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </ListboxButton>

        <ListboxOptions
          modal={false}
          className="absolute z-10 mt-1 w-full space-y-1 rounded-xl
                     border border-gray-200 bg-white p-2 shadow-lg"
        >
          {options.map((o) => (
            <ListboxOption
              key={o.id}
              value={o.id}
              as="div"
              onMouseUp={() => onChange(o.id)}
              className={({ focus, selected }) =>
                [
                  "cursor-pointer select-none rounded-lg px-4 py-2 text-sm",
                  focus && "ring-2 ring-blue-500",
                  selected && "font-semibold",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {o.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

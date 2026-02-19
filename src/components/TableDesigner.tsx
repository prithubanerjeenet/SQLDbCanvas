import type { Table, Column } from "../pageTypes/Index";

interface Props {
  table: Table;
  updateTable: (table: Table) => void;
}

const dataTypes: string[] = [
  "int",
  "varchar(255)",
  "datetime",
  "bit",
  "decimal(18,2)",
];

export default function TableDesigner({ table, updateTable }: Props) {
  const addColumn = () => {
    const newColumn: Column = {
      id: Date.now(),
      name: "",
      type: "int",
      isPrimary: false,
      isNullable: true,
    };

    updateTable({
      ...table,
      columns: [...table.columns, newColumn],
    });
  };

  const updateColumn = (
    id: number,
    field: keyof Column,
    value: string | boolean
  ) => {
    const updatedColumns = table.columns.map((col) =>
      col.id === id ? { ...col, [field]: value } : col
    );

    updateTable({
      ...table,
      columns: updatedColumns,
    });
  };

  const generateSQL = (): string => {
    const columnDefinitions = table.columns.map((col) => {
      const notNull = col.isNullable ? "" : "NOT NULL";
      const primary = col.isPrimary ? "PRIMARY KEY" : "";
      return `${col.name} ${col.type} ${notNull} ${primary}`.trim();
    });

    return `CREATE TABLE ${table.name} (
${columnDefinitions.join(",\n")}
);`;
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Table: {table.name}</h3>

      <button onClick={addColumn}>Add Column</button>

      <table border={1} cellPadding={5} style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Primary</th>
            <th>Nullable</th>
          </tr>
        </thead>
        <tbody>
          {table.columns.map((col) => (
            <tr key={col.id}>
              <td>
                <input
                  value={col.name}
                  onChange={(e) =>
                    updateColumn(col.id, "name", e.target.value)
                  }
                />
              </td>

              <td>
                <select
                  value={col.type}
                  onChange={(e) =>
                    updateColumn(col.id, "type", e.target.value)
                  }
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="checkbox"
                  checked={col.isPrimary}
                  onChange={(e) =>
                    updateColumn(col.id, "isPrimary", e.target.checked)
                  }
                />
              </td>

              <td>
                <input
                  type="checkbox"
                  checked={col.isNullable}
                  onChange={(e) =>
                    updateColumn(col.id, "isNullable", e.target.checked)
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: "20px" }}>Generated SQL</h4>
      <pre>{generateSQL()}</pre>
    </div>
  );
}

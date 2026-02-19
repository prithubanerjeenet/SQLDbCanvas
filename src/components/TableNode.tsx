import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { TableNodeData } from "../pageTypes/TableType";
import { useEffect, useState } from "react";

interface Props {
  id: string;
  data: TableNodeData;
}

export default function TableNode({ id, data }: Props) {
  const { setNodes, setEdges } = useReactFlow();
  const [isDeleting, setIsDeleting] = useState(false);
   //const [lastAddedColumnId, setLastAddedColumnId] = useState<number | null>(null);
  //const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  
  const updateNode = (updatedColumns: any, updatedName?: string) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? {
            ...node,
            data: {
              ...node.data,
              table: {
                ...data.table,
                name: updatedName ?? data.table.name,
                columns: updatedColumns,
              },
            },
          }
          : node
      )
    );
  };

  const updateTableName = (name: string) => {
    updateNode(data.table.columns, name);
  };

  const addColumn = () => {
    const newCol = {
      id: Date.now(),
      name: "",
      type: "NVARCHAR",
      isPrimary: false,
      isNullable: true,
      typeLength: 255,
    };

    updateNode([...data.table.columns, newCol]);
    //  setLastAddedColumnId(newCol.id);
  };

  const updateColumn = (colId: number, field: string, value: any) => {
    const updated = data.table.columns.map((col) =>
      col.id === colId ? { ...col, [field]: value } : col
    );
    updateNode(updated);
  };

  const deleteColumn = (colId: number) => {
    const updated = data.table.columns.filter((c) => c.id !== colId);
    updateNode(updated);
  };

  // onDelete of table. 
  const onDelete = () => {
    setIsDeleting(true);

    setTimeout(() => {
      setNodes((nodes) =>
        nodes.filter((node) => node.id !== id)
      );

      setEdges((edges) =>
        edges.filter(
          (edge) =>
            edge.source !== id && edge.target !== id
        )
      );
    }, 250); // match animation duration
  };


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Delete") {
        setNodes((nodes) =>
          nodes.filter((node) => !node.selected)
        );

        setEdges((edges) =>
          edges.filter(
            (edge) => !edge.selected
          )
        );
      }

      if (event.ctrlKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        data.addTable?.();
      }

       if (event.ctrlKey && event.key.toLowerCase() === "r") {
        event.preventDefault();
        addColumn();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setNodes, setEdges]);


  // useEffect(() => {
  //   if (
  //     lastAddedColumnId &&
  //     inputRefs.current[lastAddedColumnId]
  //   ) {
  //     inputRefs.current[lastAddedColumnId]?.focus();
  //   }
  // }, [lastAddedColumnId]);

  return (
    <div
      className="table-node"
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div className={`table-node ${isDeleting ? "deleting" : ""}`}>
        <div className="prithu-flex">
          <input
            className="table-title"
            value={data.table.name}
            onChange={(e) => updateTableName(e.target.value)}
          />
          <div
            style={{
              padding: "2px",
              cursor: "pointer",
              color: "red",
            }}
            onClick={onDelete}
          >
            &times;
          </div>
        </div>


        <ul className="prithu-column">
          {data.table.columns.map((col) => (
            <li key={col.id} className="column-row">

              <Handle
                type="target"
                position={Position.Left}
                id={`target-${col.id}`}
              />

              <input
                
                value={col.name}
                onChange={(e) =>
                  updateColumn(col.id, "name", e.target.value)
                }
                placeholder="ColumnName"
              
              />

              <select
                value={col.type}
                onChange={(e) =>
                  updateColumn(col.id, "type", e.target.value)
                }
              >
                <option value="INT">int</option>
                <option value="NVARCHAR">nvarchar</option>
                <option value="VARCHAR">varchar</option>
                <option value="TEXT">text</option>
                <option value="DATE">date</option>
                <option value="BOOLEAN">boolean</option>
              </select>


              <input
                value={col.typeLength || ""}
                onChange={(e) =>
                  updateColumn(col.id, "typeLength", e.target.value)
                }
                placeholder="Length"
                style={{ width: "60px" }}
                disabled={col.type === "INT" || col.type === "DATE" || col.type === "BOOLEAN"}
              />

              <label>
                <input
                  type="checkbox"
                  checked={col.isPrimary}
                  onChange={() =>
                    updateColumn(col.id, "isPrimary", !col.isPrimary)
                  }
                />
                PK
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={col.isNullable}
                  onChange={() =>
                    updateColumn(col.id, "isNullable", !col.isNullable)
                  }
                />
                Null
              </label>

              <button className="close-button" onClick={() => deleteColumn(col.id)} >✕</button>

              <Handle
                type="source"
                position={Position.Right}
                id={`source-${col.id}`}
              />
            </li>
          ))}
        </ul>

        <button onClick={addColumn}>+ Add Column</button>
      </div>
    </div>
  );
}

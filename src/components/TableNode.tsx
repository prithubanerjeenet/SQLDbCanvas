import { Handle, Position, useReactFlow } from "@xyflow/react";
import type { TableNodeData } from "../pageTypes/TableType";
import React, { useEffect, useRef, useState } from "react";


interface Props {
  id: string;
  data: TableNodeData;
}

export default function TableNode({ id, data }: Props) {
  const { setNodes, setEdges } = useReactFlow();
  const [isDeleting, setIsDeleting] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
const [dragPosition, setDragPosition] = useState<{
  id: number | null;
  type: "above" | "below" | null;
}>({ id: null, type: null });
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

const onDragStart = (
  ev: React.DragEvent<HTMLSpanElement>,
  colId: number
) => {
  dragItem.current = colId;
  ev.dataTransfer.effectAllowed = "move";
  ev.currentTarget.closest("li")?.classList.add("dragging");
};

const onDragOver = (
  ev: React.DragEvent<HTMLLIElement>,
  colId: number
) => {
  ev.preventDefault();

  const rect = ev.currentTarget.getBoundingClientRect();
  const midpoint = rect.top + rect.height / 2;

  const position =
    ev.clientY < midpoint ? "above" : "below";

  dragOverItem.current = colId;
  setDragPosition({ id: colId, type: position });
};

const onDrop = (ev: React.DragEvent<HTMLLIElement>) => {
  ev.preventDefault();

  if (
    dragItem.current === null ||
    dragOverItem.current === null
  )
    return;

  const draggedId = dragItem.current;
  const targetId = dragOverItem.current;

  if (draggedId === targetId) return;

  const updatedColumns = [...data.table.columns];

  const dragIndex = updatedColumns.findIndex(
    (c) => c.id === draggedId
  );
  const overIndex = updatedColumns.findIndex(
    (c) => c.id === targetId
  );

  const [draggedColumn] =
    updatedColumns.splice(dragIndex, 1);

  const insertIndex =
    dragPosition.type === "below"
      ? overIndex + 1
      : overIndex;

  updatedColumns.splice(insertIndex, 0, draggedColumn);

  updateNode(updatedColumns);

  document
    .querySelectorAll(".dragging")
    .forEach((el) =>
      el.classList.remove("dragging")
    );

  dragItem.current = null;
  dragOverItem.current = null;
  setDragPosition({ id: null, type: null });
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
            <li key={col.id}className={`column-row nodrag ${
    dragPosition.id === col.id &&
    dragPosition.type === "above"
      ? "drop-above"
      : ""
  } ${
    dragPosition.id === col.id &&
    dragPosition.type === "below"
      ? "drop-below"
      : ""
  }`}
              onDragStart={(e) => onDragStart(e, col.id)}
             onDragOver={(e) => onDragOver(e, col.id)}
              onDrop={onDrop}
            
            >
            {/* drag handle icon */}
              <span
                className="drag-handle nodrag"
                draggable
                onDragStart={(e) => onDragStart(e, col.id)}
              >
                ≡
              </span>
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
                <option value="BIGINT">BIGINT</option> 
                <option value="INT">INT</option> 
                <option value="SMALLINT">SMALLINT</option> 
                <option value="TINYINT">TINYINT</option> 
                <option value="BIT">BIT</option> 
                <option value="DECIMAL">DECIMAL</option> 
                <option value="NUMERIC">NUMERIC</option> 
                <option value="MONEY">MONEY</option> 
                <option value="SMALLMONEY">SMALLMONEY</option> 
                <option value="FLOAT">FLOAT</option> 
                <option value="REAL">REAL</option> 
                <option value="CHAR">CHAR</option> 
                <option value="VARCHAR">VARCHAR</option> 
                <option value="NCHAR">NCHAR</option> 
                <option value="NVARCHAR">NVARCHAR</option> 
                <option value="BINARY">BINARY</option> 
                <option value="VARBINARY(MAX)">VARBINARY(MAX)</option> 
                <option value="DATE">DATE</option> 
                <option value="DATETIME">DATETIME</option> 
                <option value="DATETIME2">DATETIME2</option> 
                <option value="SMALLDATETIME">SMALLDATETIME</option> 
                <option value="DATETIMEOFFSET">DATETIMEOFFSET</option> 
                <option value="TIME">TIME</option> 
                <option value="UNIQUEIDENTIFIER">UNIQUEIDENTIFIER</option> 
                <option value="XML">XML</option>  
                <option value="TABLE">TABLE</option> 
                <option value="SQL_VARIANT">SQL_VARIANT</option> 
              </select>


              <input
                value={col.typeLength || ""}
                onChange={(e) =>
                  updateColumn(col.id, "typeLength", e.target.value)
                }
                placeholder="Length"
                style={{ width: "60px" }}
                disabled={col.type !== "VARCHAR" && col.type !== "NCHAR" && col.type !== "NVARCHAR" && col.type !== "VARBINARY(MAX)"}
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

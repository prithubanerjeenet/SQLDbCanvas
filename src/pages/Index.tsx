import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  Controls,
} from "@xyflow/react";

import type { Connection, Edge, Node } from "@xyflow/react";
import type { Table, TableNodeData } from "../pageTypes/TableType";
import TableNode from "../components/TableNode";

const STORAGE_KEY = "er-diagram";

const initialNodes: Node<TableNodeData>[] = [
  {
    id: "1",
    type: "tableNode",
    position: { x: 100, y: 100 },
    data: {
      table: {
        id: 1,
        name: "Users",
        columns: [
          {
            id: 1,
            name: "Id",
            type: "int",
            isPrimary: true,
            isNullable: false,
          },
        ],
      },
    },
  },
];

const initialEdges: Edge[] = [];

const nodeTypes = {
  tableNode: TableNode
};

export default function Index() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<TableNodeData>>(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
   const [showModal, setShowModal] = useState(false);
   const [sqlScript, setSqlScript] = useState<string>("");

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) =>
        addEdge({ ...connection, animated: true }, eds)
      ),
    [setEdges]
  );

  // auto save to local storage
  useEffect(() => {
    const data = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [nodes, edges]);


  // load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
    }
  }, [setNodes, setEdges]);

  // add table
  const addTable = () => {
    const id = Date.now();

    const newNode: Node<TableNodeData> = {
      id: id.toString(),
      type: "tableNode",
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        table: {
          id,
          name: "NewTable",
          columns: [],
        },
        addTable: addTable,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  // duplicate table.
  const duplicateTable = () => {
    const selectedNode = nodes.find((n) => n.selected);

    if (!selectedNode) return;

    const newId = Date.now();

    const duplicatedTable: Table = {
      ...selectedNode.data.table,
      id: newId,
      name: selectedNode.data.table.name + "_copy",
      columns: selectedNode.data.table.columns.map((col) => ({
        ...col,
        id: Date.now() + Math.random(),
      })),
    };

    const newNode: Node<TableNodeData> = {
      ...selectedNode,
      id: newId.toString(),
      position: {
        x: selectedNode.position.x + 40,
        y: selectedNode.position.y + 40,
      },
      selected: false,
      data: {
        table: duplicatedTable,
        addTable,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };


  // export json
  const exportJSON = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "er-diagram.json";
    a.click();
    URL.revokeObjectURL(url);
  };


  // import json
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const parsed = JSON.parse(event.target?.result as string);
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
    };
    reader.readAsText(file);
  };

  const generateSQL = () => {
    let sql = "";

    nodes.forEach((node) => {
      const table = node.data.table;

      sql += `CREATE TABLE ${table.name} (\n`;

      table.columns.forEach((col, index) => {
        const needLength = col.type === "INT" || col.type === "DATE" || col.type === "BOOLEAN" ? false : true;
        sql += `  ${col.name} ${col.type} ${needLength && col.typeLength ? `(${col.typeLength})` : ""}`;

        if (!col.isNullable) sql += " NOT NULL";
        if (col.isPrimary) sql += " PRIMARY KEY";

        if (index !== table.columns.length - 1)
          sql += ",";

        sql += "\n";
      });

      sql += ");\n\n";
    });

    setSqlScript(sql);
    setShowModal(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateTable();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, [nodes]);

  return (
    <div style={{ height: "100vh" }}>
      <div className="prithu-hide-me" title="A simple ER diagram tool built with React Flow. Create tables, define columns, and visualize relationships. Export and import your diagrams as JSON files. Perfect for quick database schema design and sharing! By Prithu Banerjee.">
       SQL DbCanvas 
      </div>
      {/* Buttons */}
      <div
        style={{
          position: "absolute",
          zIndex: 10,
          top: 10,
          left: 10,
          display: "flex",
          gap: 10,
        }}
      >
        <div>
            <label style={{color:'red', fontWeight:'bold', fontSize: '1.2em'}}>SQL DbCanvas </label><br/>
            <label style={{ fontSize: "0.8em", color: "#666" }}>
              By Prithu Banerjee <sup>v1.0.0.1</sup></label>
        </div>
        
        <button onClick={addTable}>Add Table (Ctrl+A)</button>
        <button onClick={exportJSON}>Export</button>
        <button onClick={generateSQL}>Generate SQL</button>
        <input type="file" onChange={importJSON} placeholder="Choose SQL DBCanvas Json file." title="Choose SQL DbCanvas Json file."/>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Generated SQL Script</h3>

            <pre className="sql-box">
              {sqlScript}
            </pre>

            <div className="modal-actions">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    sqlScript
                  );
                }}
              >
                Copy
              </button>

              <button
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

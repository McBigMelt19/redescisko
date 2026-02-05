import React, { useCallback } from 'react'; // Agregamos useCallback
import ReactFlow, {
    Background,
    Controls,
    useNodesState, // Para manejar estado de nodos
    useEdgesState, // Para manejar estado de cables
    addEdge        // Función mágica para conectar
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';

const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'PC Juan' }, style: { border: '1px solid #777', padding: 10, borderRadius: '5px' } },
    { id: '2', position: { x: 400, y: 100 }, data: { label: 'Router' }, style: { background: '#333', color: '#fff', padding: 10, borderRadius: '50%' } },
];

const lienzo = () => {
    // Hooks de React Flow para gestionar cambios
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]); // Empieza sin cables

    // Esta función se ejecuta cuando sueltas un cable sobre otro nodo
    const onConnect = useCallback((params) => {
        console.log('Conectando:', params); // Para que veas en consola qué pasa
        setEdges((eds) => addEdge(params, eds));
    }, [setEdges]);

    return (
        <CCard className="mb-4">
            <CCardHeader>Simulador de Red - Fase 2: Conectividad</CCardHeader>
            <CCardBody style={{ height: '70vh' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange} // Permite mover nodos
                    onEdgesChange={onEdgesChange} // Permite seleccionar/borrar cables
                    onConnect={onConnect}         // ¡Permite crear cables!
                    fitView
                >
                    <Background color="#aaa" gap={16} />
                    <Controls />
                </ReactFlow>
            </CCardBody>
        </CCard>
    );
};

export default lienzo;
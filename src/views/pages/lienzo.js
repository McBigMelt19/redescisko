import React, { useCallback, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    CCard, CCardBody, CCardHeader,
    CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter,
    CButton, CFormInput, CFormLabel
} from '@coreui/react';

// Estilos visuales definidos fuera para no ensuciar el componente
const pcStyle = { width: 100, height: 80, border: '2px solid #321fdb', borderRadius: '5px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' };
const routerStyle = { width: 80, height: 80, borderRadius: '50%', background: '#2eb85c', color: 'white', border: '2px dashed #1b9e3e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' };

const initialNodes = [
    { id: '1', position: { x: 100, y: 100 }, data: { label: 'PC Juan' }, style: pcStyle },
    { id: '2', position: { x: 400, y: 100 }, data: { label: 'Router 1' }, style: routerStyle },
];

const lienzo = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // ESTADO PARA EL MODAL
    const [visible, setVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null); // ¿Qué nodo estamos editando?

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // DETECTAR DOBLE CLIC
    const onNodeDoubleClick = (event, node) => {
        setSelectedNode(node); // Guardamos qué nodo se tocó
        setVisible(true);      // Abrimos el modal
    };

    return (
        <>
            <CCard className="mb-4">
                <CCardHeader>lienzo de Red - McBigMelt19</CCardHeader>
                <CCardBody style={{ height: '70vh' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeDoubleClick={onNodeDoubleClick} // ¡Aquí ocurre la magia!
                        fitView
                    >
                        <Background color="#aaa" gap={16} />
                        <Controls />
                    </ReactFlow>
                </CCardBody>
            </CCard>

            {/* VENTANA DE CONFIGURACIÓN (MODAL) */}
            <CModal visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Configurar Dispositivo</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {selectedNode && (
                        <>
                            <p>Editando: <strong>{selectedNode.data.label}</strong> (ID: {selectedNode.id})</p>
                            <div className="mb-3">
                                <CFormLabel>Dirección IP</CFormLabel>
                                <CFormInput placeholder="Ej: 192.168.1.10" />
                            </div>
                            <div className="mb-3">
                                <CFormLabel>Máscara de Subred</CFormLabel>
                                <CFormInput placeholder="Ej: 255.255.255.0" />
                            </div>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>Cancelar</CButton>
                    <CButton color="primary">Guardar Configuración</CButton>
                </CModalFooter>
            </CModal>
        </>
    );
};

export default lienzo;
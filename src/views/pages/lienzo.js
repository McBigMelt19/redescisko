import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
    CCard, CCardBody, CCardHeader,
    CModal, CModalHeader, CModalTitle, CModalBody,
    CButton, CFormInput, CFormLabel, CRow, CCol, CButtonGroup
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTerminal, cilMonitor, cilRouter, cilLan, cilStorage, cilSave, cilFolderOpen } from '@coreui/icons';
import Sidebar from './sidebar';

// Estilos visuales
const deviceStyle = { width: 80, height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', backgroundColor: 'transparent' };

let id = 3;
const getId = () => `${id++}`;

// Función auxiliar de subred
const areInSameSubnet = (ip1, ip2) => {
    if (!ip1 || !ip2) return false;
    const parts1 = ip1.split('.');
    const parts2 = ip2.split('.');
    return parts1[0] === parts2[0] && parts1[1] === parts2[1] && parts1[2] === parts2[2];
};

const initialNodes = [
    { id: '1', position: { x: 250, y: 100 }, data: { label: 'PC Inicial', type: 'pc', ip: '', mask: '' }, style: deviceStyle },
];

const Lienzo = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const [visible, setVisible] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [form, setForm] = useState({ label: '', ip: '', mask: '', gateway: '' });
    const [pingTarget, setPingTarget] = useState('');
    const [logs, setLogs] = useState([]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // --- NUEVO: FUNCIÓN GUARDAR ---
    const onSave = useCallback(() => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            localStorage.setItem('cisko-flow', JSON.stringify(flow));
            alert('¡Red guardada en el navegador! 💾');
        }
    }, [reactFlowInstance]);

    // --- NUEVO: FUNCIÓN CARGAR ---
    const onRestore = useCallback(() => {
        const restoreFlow = async () => {
            const flow = JSON.parse(localStorage.getItem('cisko-flow'));

            if (flow) {
                const { x = 0, y = 0, zoom = 1 } = flow.viewport;
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
                // Restaurar vista
                // reactFlowInstance.setViewport({ x, y, zoom }); 
            }
        };
        restoreFlow();
    }, [setNodes, setEdges]);

    // --- ANIMACIÓN CABLE ---
    const animarCable = (idOrigen, idDestino, encender) => {
        setEdges((eds) =>
            eds.map((edge) => {
                const esElCable = (edge.source === idOrigen && edge.target === idDestino) ||
                    (edge.target === idOrigen && edge.source === idDestino);
                if (esElCable) {
                    return {
                        ...edge,
                        animated: encender,
                        style: { ...edge.style, stroke: encender ? '#ff0000' : '#b1b1b7', strokeWidth: encender ? 3 : 1 }
                    };
                }
                return edge;
            })
        );
    };

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow');
            const label = event.dataTransfer.getData('application/label');
            if (typeof type === 'undefined' || !type) return;
            const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
            const newNode = {
                id: getId(),
                type: 'default',
                position,
                data: { label: `${label}`, type: type, ip: '', mask: '' },
                style: deviceStyle,
            };
            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );

    const getDeviceIcon = (type) => {
        switch (type) {
            case 'pc': return <CIcon icon={cilMonitor} size="3xl" style={{ color: '#321fdb' }} />;
            case 'router': return <CIcon icon={cilRouter} size="3xl" style={{ color: '#e55353' }} />;
            case 'switch': return <CIcon icon={cilLan} size="3xl" style={{ color: '#f9b115' }} />;
            default: return <CIcon icon={cilStorage} size="3xl" />;
        }
    };

    const onNodeDoubleClick = (event, clickedNode) => {
        const cleanNode = nodes.find(n => n.id === clickedNode.id);
        setSelectedNode(cleanNode);
        setForm({
            label: cleanNode.data.label || '',
            ip: cleanNode.data.ip || '',
            mask: cleanNode.data.mask || '',
            gateway: cleanNode.data.gateway || ''
        });
        setLogs([]);
        setPingTarget('');
        setVisible(true);
    };

    const guardarCambios = () => {
        setNodes((nds) => nds.map((node) => node.id === selectedNode.id ? { ...node, data: { ...node.data, ...form } } : node));
        setVisible(false);
    };

    const handlePing = () => {
        if (!form.ip) { setLogs(prev => [...prev, `❌ Error: Configura tu propia IP primero.`]); return; }
        if (!pingTarget) { setLogs(prev => [...prev, `❌ Error: Escribe una IP de destino.`]); return; }

        setLogs(prev => [...prev, `\n> Pinging ${pingTarget} con 32 bytes de datos:`]);
        const targetNode = nodes.find(n => n.data.ip === pingTarget);

        if (!targetNode) {
            setTimeout(() => { setLogs(prev => [...prev, `🚫 Tiempo de espera agotado. (Destino inalcanzable)`]); }, 500);
            return;
        }
        if (targetNode.id === selectedNode.id) {
            setLogs(prev => [...prev, `✅ Reply from localhost: tiempo<1ms`]);
            return;
        }

        const directConnection = edges.some(edge =>
            (edge.source === selectedNode.id && edge.target === targetNode.id) ||
            (edge.target === selectedNode.id && edge.source === targetNode.id)
        );
        const sameSubnet = areInSameSubnet(form.ip, pingTarget);

        setTimeout(() => {
            if (sameSubnet) {
                if (directConnection) {
                    animarCable(selectedNode.id, targetNode.id, true);
                    setTimeout(() => animarCable(selectedNode.id, targetNode.id, false), 2000);
                    setLogs(prev => [...prev, `✅ Reply from ${pingTarget}: bytes=32 time=2ms TTL=64`]);
                    setLogs(prev => [...prev, `    Paquetes: enviados=1, recibidos=1`]);
                } else {
                    setLogs(prev => [...prev, `⚠️ Destination Host Unreachable (Sin cable)`]);
                }
            } else {
                if (!form.gateway) {
                    setLogs(prev => [...prev, `❌ Error: Transmisión fallida. (Falta Gateway)`]);
                } else {
                    if (directConnection) { // Simulación simple de gateway conectado
                        setLogs(prev => [...prev, `✅ Reply from ${pingTarget}: bytes=32 time=12ms TTL=54 (Routed)`]);
                    } else {
                        setLogs(prev => [...prev, `⚠️ Request Timed Out.`]);
                    }
                }
            }
        }, 800);
    };

    return (
        <>
            <CCard className="mb-4">
                <CCardHeader className="d-flex justify-content-between align-items-center">
                    <strong>Lienzo de Red - McBigMelt19</strong>
                    {/* BOTONES DE GUARDADO */}
                    <CButtonGroup>
                        <CButton color="info" variant="outline" onClick={onRestore} title="Cargar última sesión">
                            <CIcon icon={cilFolderOpen} /> Cargar
                        </CButton>
                        <CButton color="success" onClick={onSave} title="Guardar en navegador">
                            <CIcon icon={cilSave} className="me-2" /> Guardar Red
                        </CButton>
                    </CButtonGroup>
                </CCardHeader>
                <CCardBody style={{ height: '75vh', padding: 0 }}>
                    <ReactFlowProvider>
                        <div className="d-flex" style={{ height: '100%' }} ref={reactFlowWrapper}>
                            <Sidebar />
                            <div style={{ flexGrow: 1, height: '100%' }}>
                                <ReactFlow
                                    nodes={nodes.map(n => ({
                                        ...n,
                                        data: {
                                            ...n.data, label: (
                                                <div style={{ textAlign: 'center' }}>
                                                    {getDeviceIcon(n.data.type)}
                                                    <div style={{ fontWeight: 'bold', marginTop: '5px' }}>{n.data.label}</div>
                                                    {n.data.ip && <div style={{ color: 'red', fontSize: '10px', background: 'white', border: '1px solid #ddd' }}>{n.data.ip}</div>}
                                                </div>
                                            )
                                        }
                                    }))}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    onConnect={onConnect}
                                    onNodeDoubleClick={onNodeDoubleClick}
                                    onInit={setReactFlowInstance}
                                    onDrop={onDrop}
                                    onDragOver={onDragOver}
                                    fitView
                                >
                                    <Background color="#f0f0f0" gap={20} />
                                    <Controls />
                                </ReactFlow>
                            </div>
                        </div>
                    </ReactFlowProvider>
                </CCardBody>
            </CCard>

            <CModal visible={visible} onClose={() => setVisible(false)} size="lg">
                <CModalHeader><CModalTitle>Configurar</CModalTitle></CModalHeader>
                <CModalBody>
                    <CRow>
                        <CCol md={5} style={{ borderRight: '1px solid #eee' }}>
                            <h6 className="mb-3">Configuración TCP/IP</h6>
                            <div className="mb-2"><CFormLabel>Nombre</CFormLabel><CFormInput value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
                            <div className="mb-2"><CFormLabel>IP</CFormLabel><CFormInput value={form.ip} onChange={e => setForm({ ...form, ip: e.target.value })} /></div>
                            <div className="mb-2"><CFormLabel>Máscara</CFormLabel><CFormInput value={form.mask} onChange={e => setForm({ ...form, mask: e.target.value })} /></div>
                            <div className="mb-3"><CFormLabel>Gateway</CFormLabel><CFormInput value={form.gateway} onChange={e => setForm({ ...form, gateway: e.target.value })} /></div>
                            <CButton onClick={guardarCambios} color="primary" className="w-100">Guardar</CButton>
                        </CCol>
                        <CCol md={7}>
                            <div style={{ background: '#111', color: '#0f0', padding: 10, borderRadius: 5, height: '100%', fontFamily: 'monospace', fontSize: 12, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                                    <div>Microsoft Windows [Versión 10.0]</div>
                                    <div>(c) Microsoft Corporation.</div>
                                    <br />
                                    {logs.map((l, i) => <div key={i} style={{ whiteSpace: 'pre-wrap' }}>{l}</div>)}
                                </div>
                                <div className="d-flex mt-2 gap-2">
                                    <span style={{ paddingTop: 5 }}>{`C:\\Users\\${form.label}>`}</span>
                                    <input
                                        style={{ background: 'transparent', border: 'none', color: '#0f0', outline: 'none', flexGrow: 1 }}
                                        value={pingTarget}
                                        onChange={e => setPingTarget(e.target.value)}
                                        placeholder="ping..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') handlePing() }}
                                    />
                                    <CButton size="sm" color="secondary" onClick={handlePing}>↵</CButton>
                                </div>
                            </div>
                        </CCol>
                    </CRow>
                </CModalBody>
            </CModal>
        </>
    );
};

export default Lienzo;
import React from 'react';
import CIcon from '@coreui/icons-react';
import { cilMonitor, cilRouter, cilLan } from '@coreui/icons';

export default () => {
    // Función para iniciar el arrastre
    const onDragStart = (event, nodeType, label) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.setData('application/label', label);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div style={{ padding: '15px', borderRight: '1px solid #ddd', background: '#f8f9fa', width: '150px' }}>
            <h6 className="mb-3 text-muted">Herramientas</h6>

            {/* Ítem: PC */}
            <div
                draggable
                onDragStart={(event) => onDragStart(event, 'pc', 'PC Genérico')}
                style={{ marginBottom: '15px', cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <CIcon icon={cilMonitor} size="xl" style={{ color: '#321fdb' }} />
                <small>PC Usuario</small>
            </div>

            {/* Ítem: Router */}
            <div
                draggable
                onDragStart={(event) => onDragStart(event, 'router', 'Router Nuevo')}
                style={{ marginBottom: '15px', cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <CIcon icon={cilRouter} size="xl" style={{ color: '#e55353' }} />
                <small>Router</small>
            </div>

            {/* Ítem: Switch */}
            <div
                draggable
                onDragStart={(event) => onDragStart(event, 'switch', 'Switch L2')}
                style={{ marginBottom: '15px', cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
                <CIcon icon={cilLan} size="xl" style={{ color: '#f9b115' }} />
                <small>Switch</small>
            </div>

            <div className="mt-4 text-center text-muted" style={{ fontSize: '10px' }}>
                Arrastra al lienzo
            </div>
        </div>
    );
};
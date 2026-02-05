import React from 'react'

// Essential pages only
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const lienzo = React.lazy(() => import('./views/pages/lienzo'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/tables', name: 'Tables', element: Tables },
  { path: '/forms', name: 'Forms', element: FormControl },
  { path: '/lienzo', name: 'Lienzo', element: lienzo },
]

export default routes

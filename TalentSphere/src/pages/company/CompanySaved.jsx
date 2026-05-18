import { Navigate } from 'react-router-dom';

/** Legacy route — talent browse uses tabs on /company/talent */
export default function CompanySaved() {
  return <Navigate to="/company/talent?tab=saved" replace />;
}

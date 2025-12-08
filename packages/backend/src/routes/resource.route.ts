import { Router } from 'express';
import {
  copyResourceHandler,
  createResourceHandler,
  deleteResourceHandler,
  emptyTrashHandler,
  getOverviewHandler,
  getResourceHandler,
  getTrashedResourcesHandler,
  isMyFilesEmptyHandler,
  isTrashEmptyHandler,
  moveResourceHandler,
  moveToTrashResourceHandler,
  renameResourceHandler,
  restoreAllResourceHandler,
  restoreResourceHandler,
  togglePinResourceHandler,
  updateAccessedAtHandler,
} from '../controllers/resource.controller';

const resourceRoutes = Router();

// prefix resources
resourceRoutes.get('/', getResourceHandler);
resourceRoutes.post('/', createResourceHandler);

resourceRoutes.get('/trash', getTrashedResourcesHandler);
resourceRoutes.delete('/trash', emptyTrashHandler);

resourceRoutes.delete('/:id', deleteResourceHandler);
resourceRoutes.patch('/:id/trash', moveToTrashResourceHandler);
resourceRoutes.patch('/:id/restore', restoreResourceHandler);
resourceRoutes.patch('/restore', restoreAllResourceHandler);
resourceRoutes.patch('/:id/rename', renameResourceHandler);
resourceRoutes.patch('/:id/move', moveResourceHandler);
resourceRoutes.post('/:id/copy', copyResourceHandler);
resourceRoutes.get('/is-my-files-empty', isMyFilesEmptyHandler);
resourceRoutes.get('/overview', getOverviewHandler);
resourceRoutes.patch('/:id/toggle-pin', togglePinResourceHandler);
resourceRoutes.patch('/:id/access', updateAccessedAtHandler);
resourceRoutes.get('/is-trash-empty', isTrashEmptyHandler);

export default resourceRoutes;

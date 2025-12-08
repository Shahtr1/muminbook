import { Router } from 'express';
import { getFamilyTreeHandler } from '../controllers/family-tree.controller';

const familyTreeRoutes = Router();

// prefix family-tree
familyTreeRoutes.get('/', getFamilyTreeHandler);

export default familyTreeRoutes;

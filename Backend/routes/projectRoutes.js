const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createProject,
    getProjects,
    completeProject,
    deleteProject
} = require('../controllers/projectController');

// All project routes are protected
router.use(authMiddleware);

router.post('/', createProject);
router.get('/', getProjects);
router.put('/:id/complete', completeProject);
router.delete('/:id', deleteProject);

module.exports = router;

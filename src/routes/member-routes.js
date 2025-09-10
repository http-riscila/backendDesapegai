import express from 'express';
import {
  countMembersByCommunity,
  createMember,
  deleteMember,
  getAllMembers,
  getMemberByCommunityAndUser,
  getMemberById,
  getMembersByCommunity,
  updateMember,
  updatePartiallyMember,
} from '../controllers/member-controller.js';
import authenticateUser from '../middlewares/authenticate.js';
import authorization from '../middlewares/authorization.js';
import {
  createMemberValidator,
  updateMemberValidator,
} from '../middlewares/member-validator.js';
import handleValidationErrors from '../middlewares/validation.js';

const { authorizeCommunityMember, authorizeAdmin } = authorization;

const membersRouter = express.Router();

membersRouter.post(
  '/members',
  authenticateUser,
  createMemberValidator,
  handleValidationErrors,
  createMember
);

membersRouter.get('/members', authenticateUser, authorizeAdmin, getAllMembers);

membersRouter.get('/members/:id', authenticateUser, getMemberById);

membersRouter.get(
  '/members/:communityId',
  authenticateUser,
  getMembersByCommunity
);

membersRouter.get(
  '/members/:id/by-community-and-user',
  authenticateUser,
  getMemberByCommunityAndUser
);

membersRouter.get(
  '/members/count/by-community/:communityId',
  authenticateUser,
  countMembersByCommunity
);

membersRouter.put(
  '/members/:id',
  authenticateUser,
  authorizeCommunityMember,
  updateMemberValidator,
  handleValidationErrors,
  updateMember
);

membersRouter.patch(
  '/members/:id',
  authenticateUser,
  authorizeCommunityMember,
  updateMemberValidator,
  handleValidationErrors,
  updatePartiallyMember
);

membersRouter.delete(
  '/members/:id',
  authenticateUser,
  authorizeCommunityMember,
  deleteMember
);

export default membersRouter;

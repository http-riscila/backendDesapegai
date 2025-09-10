import prisma from '../config/prisma-client.js';
import {
  countByCommunity,
  create,
  getAll,
  getByCommunity,
  getById,
  partiallyUpdate,
  remove,
  update,
} from '../services/member-service.js';

async function createMember(req, res) {
  const memberData = req.body;
  try {
    const newMember = await create(memberData);
    res.status(201).json(newMember);
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error creating a new member', details: error.message });
  }
}

async function getAllMembers(req, res) {
  try {
    const members = await getAll();
    res.json(members);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error getting members', details: error.message });
  }
}

async function getMemberById(req, res) {
  const { id } = req.params;
  try {
    const member = await getById(id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error getting member', details: error.message });
  }
}

async function getMembersByCommunity(req, res) {
  try {
    const { communityId } = req.params;
    const communityExists = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!communityExists) {
      return res.status(404).json({ message: 'Community does not exist' });
    }

    const membersByCommunity = await getByCommunity(communityId);

    return res.status(200).json(membersByCommunity);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting members by community',
      details: error.message,
    });
  }
}

async function countMembersByCommunity(req, res) {
  try {
    const { communityId } = req.params;
    const communityExists = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!communityExists) {
      return res.status(404).json({ message: 'Community does not exist' });
    }

    const membersByCommunity = await countByCommunity(communityId);

    return res.status(200).json(membersByCommunity);
  } catch (error) {
    console.error('🔥 ERRO AO CONTAR MEMBROS:', error);
    res.status(500).json({
      message: 'Error counting members by community',
      details: error.message,
    });
  }
}

async function updateMember(req, res) {
  const { id } = req.params;
  const parsedId = Number(id);
  const memberNewData = req.body;
  try {
    const existentMember = await getById(parsedId);
    if (existentMember) {
      const updatedMember = await update(Number(id), memberNewData);
      return res.status(200).json(updatedMember);
    }
    return res.status(404).json({ message: 'Member not found' });
  } catch (error) {
    res
      .status(400)
      .json({ message: 'Error updating member', details: error.message });
  }
}

async function updatePartiallyMember(req, res) {
  const { id } = req.params;
  const parsedId = Number(id);
  const memberNewData = req.body;
  try {
    const existentMember = await getById(parsedId);
    if (existentMember) {
      const updatedMember = await partiallyUpdate(parsedId, memberNewData);
      return res.status(200).json(updatedMember);
    }
    return res.status(404).json({ message: 'Member not found' });
  } catch (error) {
    res.status(400).json({
      message: 'Error partially updating member',
      details: error.message,
    });
  }
}

async function deleteMember(req, res) {
  const { id } = req.params;
  const parsedId = Number(id);
  try {
    const existentMember = await getById(parsedId);
    if (existentMember) {
      const deletedMember = await remove(Number(id));
      return res.status(204).send();
    }
    return res.status(404).json({ message: 'Member not found' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting member',
      details: error.message,
    });
  }
}

async function getMemberByCommunityAndUser(req, res) {
  const  { id: userId }  = req.params;
  const { communityId } = req.query;
  try {
    const member = await prisma.communityMember.findFirst({
      where: {
         userId : userId, communityId: communityId
      },
    });
    console.log('Member by community and user:', member);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({
      message: 'Error getting member by community and user',
      details: error.message,
    });
  }
}

export {
  createMember,
  getAllMembers,
  getMemberById,
  getMembersByCommunity,
  countMembersByCommunity,
  getMemberByCommunityAndUser,
  updateMember,
  updatePartiallyMember,
  deleteMember,
};

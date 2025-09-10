import prisma from '../config/prisma-client.js';
import {
    countByCreator,
    create,
    getAll,
    getById,
    getByUser,
    partiallyUpdate,
    remove,
    removeCommunityImage,
    update,
    updateCommunityImage,
} from '../services/community-services.js';
import z from "zod";

async function createCommunity(req, res) {
    const userId = req.user.id;
    const communityData = req.body;
    try {
        const newCommunity = await create(communityData, userId);
        res.status(201).json(newCommunity);
    } catch (error) {
        res.status(400).json({
            message: 'Error creating a new community',
            details: error.message,
        });
    }
}

async function getAllCommunities(_, res) {

    // Obter todas as comunidades com paginação, ordenação e filtro
    const querySchema = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(10),
        orderBy: z.string().optional().default('memberCount'),
        orderDirection: z.enum(['desc', 'asc']).default('desc'),
        search: z.string().optional(),
    })

    const { page, limit, orderBy, orderDirection, search} = querySchema.parse(_.query);

    const where = search
        ? {
            OR: [
                {name: {contains: search, mode: 'insensitive'}},
                {description: {contains: search, mode: 'insensitive'}},
            ],
        }
        : {};


    try {
        const communities = await getAll(where, page, limit, orderBy, orderDirection, search);
        res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({
            message: 'Error getting communities',
            details: error.message,
        });
    }
}

async function getCommunityById(req, res) {
    const {id} = req.params;

    try {
        const community = await getById(id);

        if (!community) {
            return res.status(404).json({message: 'Community not found'});
        }

        // Buscar a categoria com mais itens associada à comunidade
        // const category = await prisma.item.groupBy({
        //     where: {communityId: id},
        //     by: ['category'],
        //     select: {
        //         category: true,
        //     },
        //     orderBy: {
        //         _count: {
        //             category: 'desc',
        //         },
        //     },
        //     take: 1,
        // });

        const memberCount = await prisma.communityMember.count({
            where: {communityId: id},
        });

        res.status(200).json({
            community: {
                ...community,
                // category: category[0].category,
                memberCount,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error getting community',
            details: error.message,
        });
    }
}

async function getCommunityByUser(req, res) {
    const {userId} = req.params;
    try {
        const communities = await getByUser(userId);
        if (!communities || communities.length === 0) {
            return res
                .status(404)
                .json({message: 'User is not a member of any community'});
        }
        return res.status(200).json(communities);
    } catch (error) {
        return res.status(500).json({
            message: 'Error getting communities by user',
            details: error.message,
        });
    }
}

async function countCommunityByCreator(req, res) {
    const {userId} = req.params;

    try {
        const communitiesByUser = await countByCreator(userId);
        return res.status(200).json(communitiesByUser);
    } catch (error) {
        res.status(500).json({
            message: 'Error counting communities by creator',
            details: error.message,
        });
    }
}

async function updateCommunity(req, res) {
    try {
        const {id} = req.params;
        const communityNewData = req.body;

        const existentCommunity = await getById(id);

        if (existentCommunity) {
            const updatedCommunity = await update(id, communityNewData);
            return res.status(200).json(updatedCommunity);
        }
        return res.status(404).json({message: 'Community not found'});
    } catch (error) {
        res.status(400).json({
            message: 'Error updating community',
            details: error.message,
        });
    }
}

async function updatePartiallyCommunity(req, res) {
    try {
        const {id} = req.params;
        const communityNewData = req.body;

        const existentCommunity = await getById(id);

        if (existentCommunity) {
            const updatedCommunity = await partiallyUpdate(id, communityNewData);
            return res.status(200).json(updatedCommunity);
        }
        return res.status(404).json({message: 'Community not found'});
    } catch (error) {
        res.status(400).json({
            message: 'Error partially updating community',
            details: error.message,
        });
    }
}

async function deleteCommunity(req, res) {
    try {
        const {id} = req.params;

        const existentCommunity = await getById(id);

        if (existentCommunity) {
            const deletedCommunity = await remove(id);
            return res.status(204).send(deletedCommunity);
        }
        return res.status(404).json({message: 'Community not found'});
    } catch (error) {
        res
            .status(500)
            .json({message: 'Error deleting community', details: error.message});
    }
}

async function updateCommunityImageController(req, res) {
    try {
        const {id} = req.params;

        const existingCommunity = await getById(id);
        if (!existingCommunity) {
            return res.status(404).json({message: 'Community not found'});
        }

        if (!req.file) {
            return res.status(400).json({message: 'No image file provided'});
        }

        const updatedCommunity = await updateCommunityImage(id, req.file.buffer);

        res.status(200).json({
            message: 'Community image updated successfully',
            community: updatedCommunity,
        });
    } catch (error) {
        console.error('Error updating community image:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

async function removeCommunityImageController(req, res) {
    try {
        const {id} = req.params;

        const existingCommunity = await getById(id);
        if (!existingCommunity) {
            return res.status(404).json({message: 'Community not found'});
        }

        if (!existingCommunity.imageUrl) {
            return res
                .status(400)
                .json({message: 'Community has no image to remove'});
        }

        const updatedCommunity = await removeCommunityImage(id);

        res.status(200).json({
            message: 'Community image removed successfully',
            community: updatedCommunity,
        });
    } catch (error) {
        console.error('Error removing community image:', error);
        res.status(500).json({message: 'Internal server error'});
    }
}

export {
    createCommunity,
    getAllCommunities,
    getCommunityById,
    getCommunityByUser,
    countCommunityByCreator,
    updateCommunity,
    updatePartiallyCommunity,
    deleteCommunity,
    updateCommunityImageController,
    removeCommunityImageController,
};

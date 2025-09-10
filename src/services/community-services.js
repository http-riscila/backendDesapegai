import prisma from '../config/prisma-client.js';
import {create as createCommunityMember} from '../services/member-service.js';
import {deleteImage, uploadImage} from '../utils/upload-utils.js';

async function create(communityData, userId) {
    const newCommunity = await prisma.community.create({
        data: {
            name: communityData.name,
            description: communityData.description,
            createdBy: userId,
        },
    });

    await createCommunityMember({
        userId,
        communityId: newCommunity.id,
        isAdmin: true,
    });
    return newCommunity;
}

async function getAll(where, page, limit, orderBy, orderDirection) {

    // Skip pula os items da página anterior e retorna apenas os items da página atual
    const skip = (page - 1) * limit;

    // Define a direção da ordenação, pode ordenar pelas colunas createdAt, name ou memberCount
    const orderMap = {
        createdAt: {createdAt: orderDirection},
        name: {name: orderDirection},
        memberCount: {members: {_count: orderDirection}},
    };

    // Define uma ordenação (orderBy), que receberá por parâmetro da função getAll
    // Chama orderMap passando o orderBy, se não existir, define a ordenação padrão como createdAt: desc
    const prismaOrderBy = orderMap[orderBy] || {createdAt: 'desc'};

    // Irá retornar as comunidades filtradas, paginadas e ordenadas caso sejam passados os parâmetros
    // Se não forem passados, irá retornar todas as comunidades
    // Retorna comunidades, e o total de comunidades (Number)
    const [communities, total] = await Promise.all([
        prisma.community.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: prismaOrderBy,
            select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
                createdAt: true,
                items: true,
                proposals: true,
                creator: {
                    omit: {
                        id: true,
                        password: true,
                        createdAt: true,
                    },
                },
                members: {
                    select: {
                        isAdmin: true,
                        user: {select: {id: true, name: true, email: true}},
                    },
                },
                // Retorna a contagem de items, propostas e membros da comunidade
                _count: {
                    select: {
                        items: true,
                        proposals: true,
                        members: true,
                    },
                },
            },

        }),
        prisma.community.count({
            where,
        }),
    ]);
    return {
        communities,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

async function getById(id) {
    return prisma.community.findUnique({
        where: {id},
        select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            createdAt: true,
            items: true,
            proposals: true,
            creator: {
                omit: {
                    id: true,
                    password: true,
                    createdAt: true,
                },
            },
            members: {
                select: {
                    isAdmin: true,
                    user: {select: {id: true, name: true, email: true}},
                },
            },
        },
    });
}

async function getByUser(userId) {
    return await prisma.community.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });
}

async function countByCreator(userId) {
    return await prisma.community.count({
        where: {createdBy: userId},
    });
}

async function update(id, communityNewData) {
    return await prisma.community.update({
        where: {id},
        data: {
            name: communityNewData.name,
            description: communityNewData.description,
        },
    });
}

async function partiallyUpdate(id, communityNewData) {
    return await prisma.community.update({
        where: {id},
        data: {
            name: communityNewData.name,
            description: communityNewData.description,
        },
    });
}

async function remove(id) {
    const community = await prisma.community.findUnique({
        where: {id},
        select: {imageUrl: true},
    });

    if (community?.imageUrl) {
        await deleteImage(community.imageUrl);
    }

    return prisma.community.delete({
        where: {id},
    });
}

/**
 * Atualiza a foto da comunidade
 * @param {string} communityId - ID da comunidade
 * @param {Buffer} imageBuffer - Buffer da imagem
 * @returns {Promise<Object>} - Comunidade atualizada
 */

async function updateCommunityImage(communityId, imageBuffer) {
    const currentCommunity = await prisma.community.findUnique({
        where: {id: communityId},
        select: {imageUrl: true},
    });

    if (currentCommunity?.imageUrl) {
        await deleteImage(currentCommunity.imageUrl);
    }

    const imageUrl = await uploadImage(
        imageBuffer,
        'communities',
        `community_${communityId}`
    );

    return await prisma.community.update({
        where: {id: communityId},
        data: {imageUrl},
        select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            createdBy: true,
        },
    });
}

/**
 * Remove a foto da comunidade
 * @param {string} communityId - ID da comunidade
 * @returns {Promise<Object>} - Comunidade atualizada
 */
async function removeCommunityImage(communityId) {
    const currentCommunity = await prisma.community.findUnique({
        where: {id: communityId},
        select: {imageUrl: true},
    });

    if (currentCommunity?.imageUrl) {
        await deleteImage(currentCommunity.imageUrl);
    }

    return prisma.community.update({
        where: {id: communityId},
        data: {imageUrl: null},
        select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
            createdBy: true,
        },
    });
}

export {
    create,
    getAll,
    getById,
    getByUser,
    countByCreator,
    update,
    partiallyUpdate,
    remove,
    updateCommunityImage,
    removeCommunityImage,
};

import bcrypt from 'bcryptjs';
import { id } from 'zod/locales';
import prisma from '../src/config/prisma-client.js';

const itemCategory = {
  BOOKS: 'BOOKS',
  ELECTRONICS: 'ELECTRONICS',
  CLOTHING: 'CLOTHING',
  TOYS: 'TOYS',
  HOME_APPLIANCES: 'HOME_APPLIANCES',
  FURNITURE: 'FURNITURE',
  SPORTS: 'SPORTS',
  MUSICAL_INSTRUMENTS: 'MUSICAL_INSTRUMENTS',
  TOOLS: 'TOOLS',
  ART_SUPPLIES: 'ART_SUPPLIES',
  STATIONERY: 'STATIONERY',
  GAMES: 'GAMES',
  GARDENING: 'GARDENING',
  VEHICLE_ACCESSORIES: 'VEHICLE_ACCESSORIES',
  PET_SUPPLIES: 'PET_SUPPLIES',
  FOOD: 'FOOD',
  HEALTH: 'HEALTH',
  BEAUTY: 'BEAUTY',
  BABY_ITEMS: 'BABY_ITEMS',
  COLLECTIBLES: 'COLLECTIBLES',
  OTHER: 'OTHER',
};

async function main() {
  console.log('Iniciando o processo de seed...');

  console.log('Limpando dados de itens existentes...');
  await prisma.communityMember.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.community.deleteMany({});
  await prisma.user.deleteMany({});

  const usersToCreate = [
    {
      // Cria um usuario com uuid definido já
      id: '423e4567-e89b-12d3-a456-426614174000',
      name: 'Wellington',
      email: 'wellington.nunes10@hotmail.com',
      password: await bcrypt.hash('Wln@h1n1', 10),
      bio: 'Administrador do sistema',
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174001',
      name: 'João',
      email: 'joao.silva@example.com',
      password: await bcrypt.hash('J0@oS1lv4', 10),
      bio: 'Entusiasta de tecnologia',
    },
  ];

  console.log('Criando usuário...');
  for (const user of usersToCreate) {
    await prisma.user.create({
      data: user,
    });
  }

  // Comunidades de exemplo
  const communities = [
    {
      id: '423e4567-e89b-12d3-a456-426614174002',
      imageUrl: '../../frontendBootcamp/public/images/bazar.jpg',
      name: 'Bazar de roupas BR',
      description:
        'Comunidade para troca de roupas, sapatos e acessórios em todo Brasil',
      createdBy: '423e4567-e89b-12d3-a456-426614174001',
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174003',
      imageUrl: '../../frontendBootcamp/public/images/livros-cultura.jpg',
      name: 'Livros e Cultura',
      description:
        'Troque livros, CDs, DVDs e outros itens culturais novos ou usados',
      createdBy: '423e4567-e89b-12d3-a456-426614174001',
    },
    {
      id: '423e4567-e89b-12d3-a456-426614174004',
      imageUrl: '../../frontendBootcamp/public/images/casa-decoracao.jpg',
      name: 'Casa e decoração',
      description: 'Comunidade para troca de itens de casa e decoração',
      createdBy: '423e4567-e89b-12d3-a456-426614174001',
    },
  ];

  console.log('Criando comunidades...');
  for (const community of communities) {
    await prisma.community.create({
      data: community,
    });
  }

  // Cria pelo menos 1 item para cada comunidade
  const itemsToCreate = [
    {
      name: 'Camiseta de algodão',
      description: 'Camiseta confortável e estilosa, tamanho M',
      imageUrl:
        'https://img.ltwebstatic.com/v4/j/spmp/2025/05/23/31/1747943289d9a2d03ddf809eff3b97c5863cf2c99d.webp',
      category: itemCategory.CLOTHING,
      communityId: '423e4567-e89b-12d3-a456-426614174002', // ID da comunidade "Bazar de roupas BR"
      createdBy: '423e4567-e89b-12d3-a456-426614174001', // ID do usuário João
      status: 'AVAILABLE', // Status do item
    },
    {
      name: 'Livro de programação',
      description: 'Aprenda a programar com este livro incrível',
      imageUrl:
        'https://tse4.mm.bing.net/th/id/OIP.vvOn1p4BoS6CODFm_vwpDAHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3',
      category: itemCategory.BOOKS,
      communityId: '423e4567-e89b-12d3-a456-426614174003', // ID da comunidade "Livros e Cultura"
      createdBy: '423e4567-e89b-12d3-a456-426614174001', // ID do usuário João
      status: 'AVAILABLE', // Status do item
    },
    {
      name: 'Vaso de cerâmica',
      description:
        'https://tse1.explicit.bing.net/th/id/OIP.M008QE8s1gE9MDJ0V59DJAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
      imageUrl: '',
      category: itemCategory.HOME_APPLIANCES,
      communityId: '423e4567-e89b-12d3-a456-426614174004', // ID da comunidade "Casa e decoração"
      createdBy: '423e4567-e89b-12d3-a456-426614174001', // ID do usuário João
      status: 'AVAILABLE', // Status do item
    },
  ];

  console.log('Criando itens...');
  for (const item of itemsToCreate) {
    await prisma.item.create({
      data: {
        name: item.name,
        description: item.description,
        imageUrl: item.imageUrl,
        category: item.category,
        communityId: item.communityId,
        createdBy: item.createdBy,
        status: item.status,
      },
    });
  }
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

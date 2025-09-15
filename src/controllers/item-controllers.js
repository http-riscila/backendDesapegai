import cloudinary from "../config/cloudinary.js";
import {
  countByStatus,
  create,
  getAll,
  getByCategory,
  getByCommunity,
  getById,
  getByUser,
  partiallyUpdate,
  remove,
  update,
} from "../services/item-services.js";

async function createItem(req, res) {
  try {
    const itemData = req.body;
    const userId = req.user.id;

    let imageUrl = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "items" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    const newItem = await create({ ...itemData, imageUrl }, userId);
    return res.status(201).json(newItem);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error creating a new item", details: error.message });
  }
}

async function getAllItems(req, res) {
  try {
    const items = await getAll();
    return res.status(200).json(items);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting items", details: error.message });
  }
}

async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const item = await getById(id);

    if (item) {
      return res.status(200).json(item);
    }
    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting item by ID",
      details: error.message,
    });
  }
}

async function getItemByCommunity(req, res) {
  try {
    const { communityId } = req.params;

    const itemsByCommunity = await getByCommunity(communityId);

    if (itemsByCommunity.length > 0) {
      return res.status(200).json(itemsByCommunity);
    }
    return res.status(404).json({ message: "Items not found" });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting item by community",
      details: error.message,
    });
  }
}

async function getItemsByCategory(req, res) {
  try {
    const { category } = req.query;

    const items = await getByCategory(category);
    if (items.length > 0) {
      return res.status(200).json(items);
    }
    return res
      .status(404)
      .json({ message: "No items found for this category" });
  } catch (error) {
    return res.status(500).json({
      message: "Error getting items by category",
      details: error.message,
    });
  }
}

async function getItemsByUser(req, res) {
  try {
    const { userId } = req.params;
    const items = await getByUser(userId);
    if (items.length > 0) {
      return res.status(200).json(items);
    }
    return res.status(404).json({ message: "No items found for this user" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error getting items by user", details: error.message });
  }
}

async function countItemsByStatus(req, res) {
  try {
    const { userId } = req.params;
    const availableItems = await countByStatus(userId);
    const count = availableItems ?? 0;
    return res.status(200).json(count);
  } catch (error) {
    return res.status(500).json({
      message: "Error counting items by status",
      details: error.message,
    });
  }
}

async function updateItem(req, res) {
  try {
    const { id } = req.params;

    const newItemData = req.body;

    const existentItem = await getById(id);

    if (!existentItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "items" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      newItemData.imageUrl = result.secure_url;
    }

    const updatedItem = await update(id, newItemData);
    return res.status(200).json(updatedItem);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating item", details: error.message });
  }
}

async function partiallyUpdateItem(req, res) {
  try {
    const { id } = req.params;

    const data = req.body;

    const existentItem = await getById(id);

    if (!existentItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "items" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      data.imageUrl = result.secure_url;
    }

    const partiallyUpdatedItem = await partiallyUpdate(id, data);
    return res.status(200).json(partiallyUpdatedItem);
  } catch (error) {
    return res.status(500).json({
      message: "Error partially updating item",
      details: error.message,
    });
  }
}

async function deleteItem(req, res) {
  try {
    const { id } = req.params;

    const existentItem = await getById(id);

    if (existentItem) {
      const removedItem = await remove(id);
      return res.status(204).send(removedItem);
    }
    return res.status(404).json({ message: "Item not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error removing item", details: error.message });
  }
}

export {
  createItem,
  getAllItems,
  getItemById,
  getItemByCommunity,
  getItemsByCategory,
  getItemsByUser,
  countItemsByStatus,
  updateItem,
  partiallyUpdateItem,
  deleteItem,
};

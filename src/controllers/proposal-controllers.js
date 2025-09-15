import {
  create,
  getAll,
  getById,
  getBySender,
  getByRecipient,
  countByUser,
  update,
  partiallyUpdate,
  remove,
} from "../services/proposal-services.js";

async function createProposal(req, res) {
  const proposalData = req.body;
  try {
    const newProposal = await create(proposalData);
    res.status(201).json(newProposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating a proposal", details: error.message });
  }
}

async function getAllProposals(req, res) {
  try {
    const proposals = await getAll();
    res.status(200).json(proposals);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting proposals", details: error.message });
  }
}

async function getProposalById(req, res) {
  try {
    const { id } = req.params;

    const proposal = await getById(id);

    if (proposal) {
      res.status(200).json(proposal);
    } else {
      res.status(404).json({ message: "Proposal not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting proposal", details: error.message });
  }
}

async function getProposalsBySender(req, res) {
  try {
    const { userId } = req.params;

    const proposals = await getBySender(userId);
    if (proposals) {
      res.status(200).json(proposals);
    } else {
      res.status(404).json({ message: "User did not send any proposals" });
    }
  } catch (error) {}
}

async function getProposalsByRecipient(req, res) {
  try {
    const { userId } = req.params;

    const proposals = await getByRecipient(userId);
    if (proposals) {
      res.status(200).json(proposals);
    } else {
      res.status(404).json({ message: "User did not receive any proposals" });
    }
  } catch (error) {}
}

async function countProposalsByUser(req, res) {
  try {
    const { id } = req.params;

    const acceptedProposals = await countByUser(id);
    const count = acceptedProposals ?? 0;
    return res.status(200).json(count);
  } catch (error) {
    return res.status(500).json({
      message: "Error counting accepted proposals by user",
      details: error.message,
    });
  }
}

async function updateProposal(req, res) {
  try {
    const { id } = req.params;
    const newProposalData = req.body;

    const existentProposal = await getById(id);

    if (!existentProposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const updatedProposal = await update(id, newProposalData);
    res.status(200).json(updatedProposal);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating proposal", details: error.message });
  }
}

async function partiallyUpdateProposal(req, res) {
  try {
    const { id } = req.params;
    const data = req.body;

    const existentProposal = await getById(id);

    if (!existentProposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const updatedProposal = await partiallyUpdate(id, data);
    res.status(200).json(updatedProposal);
  } catch (error) {
    res.status(500).json({
      message: "Error partially updating proposal",
      details: error.message,
    });
  }
}

async function removeProposal(req, res) {
  try {
    const { id } = req.params;

    const existentProposal = await getById(id);

    if (!existentProposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const deletedProposal = await remove(id);
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing proposal", details: error.message });
  }
}
export {
  createProposal,
  getAllProposals,
  getProposalById,
  getProposalsBySender,
  getProposalsByRecipient,
  countProposalsByUser,
  updateProposal,
  partiallyUpdateProposal,
  removeProposal,
};

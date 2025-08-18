import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler).patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(req, res) {
  const { username } = req.query;
  const result = await user.findOneByUsername(username);
  return res.status(200).json(result);
}

async function patchHandler(req, res) {
  const { username } = req.query;
  const userInputValues = req.body;

  const updatedUser = await user.update(username, userInputValues);
  return res.status(200).json(updatedUser);
}

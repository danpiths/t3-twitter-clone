import nextConnect from "next-connect";
import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 } from "cloudinary";
import { getServerAuthSession } from "../../server/auth";
import path from "path";

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads",
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const apiRoute = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse) {
    res.status(501).json({
      //eslint-disable-next-line
      error: `Sorry something Happened! ${error.message ? error.message : ""}`,
    });
  },
  onNoMatch(req, res) {
    res
      .status(405)
      .json({ error: `Method '${req.method ? req.method : ""}' Not Allowed` });
  },
});

apiRoute.use(upload.array("image"));

apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerAuthSession({ req, res });
  const imagePath = path.join(
    __dirname,
    "../../../../public/uploads/" +
      `${session?.user.id ? session.user.id : "garbage"}.jpg`
  );
  const uploadedImage = await v2.uploader.upload(imagePath, {
    use_filename: true,
    overwrite: true,
    unique_filename: false,
    folder: "twitter-clone",
    resource_type: "image",
    transformation: { crop: "lfill", height: 300, width: 300 },
  });
  return res.status(200).json(uploadedImage);
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};

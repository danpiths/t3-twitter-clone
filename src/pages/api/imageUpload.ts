import multer from "multer";
import type { NextApiRequest, NextApiResponse } from "next";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { env } from "../../env.mjs";
import { getServerAuthSession } from "../../server/auth";
const storage = multer.memoryStorage();
const upload = multer({ storage });
const uploadMiddleware = upload.single("image");
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});
//eslint-disable-next-line @typescript-eslint/no-explicit-any
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: any) {
  return new Promise((resolve, reject) => {
    //eslint-disable-next-line
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await runMiddleware(req, res, uploadMiddleware);
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  //eslint-disable-next-line
  console.log(req.file.buffer);
  const session = await getServerAuthSession({ req, res });
  //eslint-disable-next-line @typescript-eslint/await-thenable
  const stream = await cloudinary.uploader.upload_stream(
    {
      overwrite: true,
      unique_filename: false,
      folder: "twitter-clone",
      resource_type: "image",
      transformation: { crop: "lfill", height: 300, width: 300 },
      filename_override: session?.user.id,
    },
    (error, result) => {
      if (error) return console.error(error);
      res.status(200).json(result);
    }
  );
  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  //eslint-disable-next-line
  streamifier.createReadStream(req.file.buffer).pipe(stream);
}
export const config = {
  api: {
    bodyParser: false,
  },
};

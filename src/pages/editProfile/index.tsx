import { NextPage } from "next";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import TextInput from "../../components/Form/TextInput";
import uploadImage from "../../../public/uploadImage.svg";
import Image from "next/image";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import { SyncLoader } from "react-spinners";
import { useSession } from "next-auth/react";
import { UploadApiResponse } from "cloudinary";
import Link from "next/link";
import Head from "next/head";

const EditProfile: NextPage = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null | undefined>(null);
  const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
  const [error, setError] = useState("");
  const { data: user, isLoading } = api.user.getSelf.useQuery();
  const editUser = api.user.edit.useMutation();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    !isLoading && user?.name && setName(user.name);
  }, [user]);

  useEffect(() => {
    if (image) {
      setImageSrc(URL.createObjectURL(image));
    }
  }, [image]);

  useEffect(() => {
    if (error && name.length >= 3) {
      setError("");
    }
  }, [name]);

  const handleSubmit = async (e: ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name.length < 3) {
      setError("Name needs to be at least 3 characters long.");
      return;
    }
    if (image) {
      const formData = new FormData();
      formData.append("image", image, `${session?.user.id}.jpg`);
      const res = await fetch("/api/imageUpload", {
        body: formData,
        method: "POST",
      });
      const uploadedImage: UploadApiResponse = await res.json();
      editUser.mutate(
        { image: uploadedImage.secure_url, name },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
        }
      );
    } else {
      editUser.mutate(
        { name },
        {
          onSuccess: () => {
            router.push("/dashboard");
          },
        }
      );
    }
  };

  return (
    <ProtectedRoute>
      {editUser.isLoading ? (
        <>
          <Head>
            <title>Updating...</title>
          </Head>
          <div className="flex flex-1 flex-col items-center justify-center">
            <SyncLoader color="#f1f5f9" size={7} />
            <p className="mt-5">Updating...</p>
          </div>
        </>
      ) : (
        <>
          <Head>
            <title>Edit Profile</title>
          </Head>
          <form
            className="my-8 flex flex-1 flex-col justify-center gap-3 md:mx-auto md:w-1/4"
            onSubmit={handleSubmit}
          >
            <TextInput
              label="Name"
              value={name?.length ? name : ""}
              setValue={setName}
            />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              maxLength={1}
              ref={fileRef}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setImage(e.target.files[0]);
                }
              }}
            />
            <button
              type="button"
              className="primary-btn flex items-center justify-center gap-3 bg-sky-400 capitalize hover:bg-sky-500 focus:bg-sky-500 focus:ring-sky-500 active:bg-sky-700 active:ring-sky-700"
              onClick={() => {
                if (image !== undefined && image !== null) {
                  setImage(null);
                  //@ts-ignore
                  fileRef.current.value = null;
                } else {
                  fileRef.current && fileRef.current.click();
                }
              }}
            >
              {image === undefined ||
                (image === null && (
                  <Image
                    src={uploadImage}
                    alt="Upload Image"
                    className="h-5 w-5"
                  />
                ))}
              <p>
                {image !== undefined && image !== null
                  ? "Remove Image"
                  : "Upload New Image"}
              </p>
            </button>
            <div className="flex-1 md:flex-none">
              <p className="font-bold">Image:</p>
              {user?.image && (
                <Image
                  src={
                    image !== undefined &&
                    image !== null &&
                    typeof imageSrc === "string"
                      ? imageSrc
                      : user.image
                  }
                  alt="Uploaded Image Preview"
                  width={100}
                  height={100}
                  className="mx-auto h-24 w-24 rounded-full object-cover object-center"
                  priority={true}
                />
              )}
            </div>
            <button
              type="submit"
              className="primary-btn bg-blue-400 hover:bg-blue-500 focus:bg-blue-500 focus:ring-blue-500 active:bg-blue-700 active:ring-blue-700 md:mt-4"
            >
              Edit
            </button>
            <Link
              href={"/dashboard"}
              className="primary-btn bg-indigo-400 text-center hover:bg-indigo-500 focus:bg-indigo-500 focus:ring-indigo-500 active:bg-indigo-700 active:ring-indigo-700"
            >
              Go Back
            </Link>
            {error ? (
              <p className="text-center text-sm text-rose-400">{error}</p>
            ) : (
              <></>
            )}
          </form>
        </>
      )}
    </ProtectedRoute>
  );
};

export default EditProfile;

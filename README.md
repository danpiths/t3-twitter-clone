# T3 Twitter Clone

A clone of twitter that allows you to tweet, like a tweet, follow people and search for them, change your own profile and delete your profile without leaving a trace anywhere in the app, not even in the database!

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with [`create-t3-app`](https://github.com/t3-oss/create-t3-app). 

[Visit Website](https://t3-twitter-clone-by-danpiths.vercel.app)

T3 stack essentially has,

- [Typescript](https://www.typescriptlang.org) to have a better experience working in Javascript land (types make the DX a 100x better, especially inferred types)
- [Next.js](https://nextjs.org) as the React Framework to create a full stack application
- [TailwindCSS](https://tailwindcss.com) for styling
- [Prisma](https://www.prisma.io) as the ORM to connect to the database and manipulate/read data in it
- [tRPC](https://trpc.io) for end-to-end typesafe APIs, so that I can make and call my APIs in one place (enables colocation for backend and frontend code)
- [Auth.js](https://authjs.dev) for authentication (Google Provider only)
- [Zod](https://zod.dev) for schema validation

 

Other Libraries/Tech used are,

- [Railway](https://railway.app) to host the [Postgresql](https://www.postgresql.org) database
- [Cloudinary](https://cloudinary.com) for image upload (user profile images)
- [Pusher](https://pusher.com) to make the app realtime and stream information
- [AutoAnimate](https://auto-animate.formkit.com) for some motion/life to the app
- [Dayjs](https://day.js.org) to format dates

![1](https://github.com/danpiths/t3-twitter-clone/assets/85949566/3f856f72-bb04-425e-8210-41752dca3fa7)

![2](https://github.com/danpiths/t3-twitter-clone/assets/85949566/d264e9b2-4365-4618-8a9c-a067557db13e)

![3](https://github.com/danpiths/t3-twitter-clone/assets/85949566/48ea4da9-0d08-4c4e-9c00-b7d7843fa7d9)

![4](https://github.com/danpiths/t3-twitter-clone/assets/85949566/6c0513e8-7009-431b-911d-7e0b11e0a6fd)

![5](https://github.com/danpiths/t3-twitter-clone/assets/85949566/b5f48a88-fa02-4fcb-a455-d3795d336937)

![6](https://github.com/danpiths/t3-twitter-clone/assets/85949566/f4d4198f-5c22-40f5-8d95-f8fd15a68684)

![7](https://github.com/danpiths/t3-twitter-clone/assets/85949566/87518ed0-bfa3-445e-9c7d-3dfc03aa007f)

![8](https://github.com/danpiths/t3-twitter-clone/assets/85949566/956eb2a9-62e4-4a96-aecc-76512c0ab1db)

![9](https://github.com/danpiths/t3-twitter-clone/assets/85949566/0a70acde-ad0e-49dc-860c-ecbf568fdcee)

![10](https://github.com/danpiths/t3-twitter-clone/assets/85949566/1f4c26ea-897c-4be6-8c0d-0f76d5f8d653)

![11](https://github.com/danpiths/t3-twitter-clone/assets/85949566/b106f08c-3545-4718-9825-41fa44561d5c)

![12](https://github.com/danpiths/t3-twitter-clone/assets/85949566/43f34231-5e65-4aab-bbe4-6746fac99655)

## Run Locally

1. Clone the repository

```bash
git clone https://github.com/danpiths/t3-twitter-clone.git
```

2. Open a terminal in the cloned folder
3. Install required packages

```bash
npm install
```

4. copy the `.env.example` to `.env` and populate the environment variables from respective sources (all instructions should be clear in `.env.example` file)
5.  Synchronise the schema and database

```bash
npx prisma db push
```

6. Run the app

```bash
npm run dev
```

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app)

## How do I deploy a T3 Stack App?

Follow their deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

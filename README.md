This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client & push schema
npx prisma generate
npx prisma db push

# 3. (Optional) Seed the database
npx prisma db seed

# 4. Run the dev server
npm run dev
```

## Project Directory Structure

invoice-generator/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── businesses/
│   │   │   │   └── route.ts
│   │   │   ├── clients/
│   │   │   │   └── route.ts
│   │   │   ├── invoices/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── pdf/
│   │   │   │           └── route.ts
│   │   │   └── settings/
│   │   │       └── route.ts
│   │   ├── invoices/
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── InvoiceForm.tsx
│   │   ├── InvoicePreview.tsx
│   │   ├── InvoicePDF.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── ClientModal.tsx
│   │   ├── BusinessModal.tsx
│   │   └── NumberToWords.ts
│   └── lib/
│       ├── prisma.ts
│       ├── currencies.ts
│       └── utils.ts
├── public/
│   └── logos/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

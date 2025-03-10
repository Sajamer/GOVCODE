# Govcode Project Setup Instructions

Follow these steps to set up the Govcode project:

## 1. Install XAMPP and Start Servers

- **Install XAMPP** and run both the **Apache** and **MySQL** services.

## 2. Install Node.js

- Download and install **Node.js** from the [official website](https://nodejs.org/).

## 3. Log into Your GitHub Account

- Ensure you're logged into your GitHub account.

## 4. Clone the Govcode Repository

- Navigate to the Govcode repository on GitHub.

- Click the **Code** dropdown and copy the repository link.

- Open your command prompt (CMD) and execute the following commands:

```bash

cd Desktop

git clone https://github.com/Sajamer/GOVCODE.git

cd govcode

```

## 5. Install Dependencies

- Install pnpm globally:

```bash

npm  install  -g  pnpm

```

- Install the project dependencies:

```bash

pnpm  i

```

## 6. Configure Environment Variables

- Create a `.env` file in the project root.
- Update the file with attribute DATABASE_URL with your database credentials.

## 7. Set Up Prisma

- Generate the Prisma client:

```bash
   pnpm prisma generate
```

- Run the database migrations:

```bash
   pnpm prisma migrate dev
```

## 8. Run the Project

- Start the development server:

```bash
   pnpm dev
```

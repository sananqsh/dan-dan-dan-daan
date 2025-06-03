# dan-dan-dan-daan
A denstistry clinic


# Setup Guide
Clone the project
```
https://github.com/sananqsh/dan-dan-dan-daan.git
cd dan-dan-dan-daan
```

Set up environment variables
```
cp .env.example .env
```
>  Set variables as you wish

Build and start containers
```
docker-compose up --build
```
- This will start:
    - Node.js app on port 3000
    - PostgreSQL database on port 5432

The APIs require an authentication token. And since the only way to add users is by having them added by users with manager and receptionist roles, the only way to start using the APIs is to seed the database with some inital data.

Seed the database with a manager and some mock data.
```
docker-compose exec app npm run seed
```
- You can edit the `seeders/**` files to customize the data.

- Access the application:
    - API will be available at: http://localhost:3000/api/*
        - The `*` can be `auth/login`, `auth/logout`, `users`, `treatments`, `appointment` or `payments`.


### Bare Metal Setup / without Docker (Not recommended)
Install PostgreSQL:
- Install PostgreSQL 13+ on your system
- Create a database (or use the default postgres database)
- Note your connection details (username, password, host, port)

Clone the repository:
```
git clone https://github.com/yourusername/your-project.git
cd your-project
```

Install dependencies:
```
npm install
```


Set up environment variables:
```
cp .env.example .env
```
>  Set variables as you wish

Start the application:
```
npm run dev
```


# Notes & Assumptions
- I assumed that patient record is the same as a list of patient's appointments; with this, I developed an user's record API that works for both patient and dentist and shows all their appointments (`/api/users/:id/record`).

# dan-dan-dan-daan
A denstistry clinic


# Setup Guide
1. Clone the project
    ```
    https://github.com/sananqsh/dan-dan-dan-daan.git
    cd dan-dan-dan-daan
    ```

2. Set up environment variables
    ```
    cp .env.example .env
    ```
    >  Set variables as you wish

3. Build and start containers
    ```
    docker-compose up --build
    ```
    - This will start:
        - Node.js app on port 3000
        - PostgreSQL database on port 5432

    > The APIs require an authentication token. And since the only way to add users is by having them added by users with manager and receptionist roles, the only way to start using the APIs is to seed the database with some inital data.

4. Seed the database with a manager and some mock data.
    ```
    docker-compose exec app npm run seed
    ```
    - You can edit the `seeders/**` files to customize the data.

5. Once seeded, you can try logging in with the manager credentials in the seeder files:
    ```
    curl -X POST \
    http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone_number": "09120001220", "password": "123123"}'
    ```
    - Copy the token given in response and use it in future requests in the `Authorization` header. Example:
    ```
    curl -X GET \
    http://localhost:3000/api/auth/me \
    -H "Authorization: Bearer {token}"
    ```

6. Access the application:
    - API will be available at: http://localhost:3000/api/*
        - The `*` can be `auth/login`, `auth/logout`, `users`, `treatments`, `appointment` or `payments`.

<hr>

### Bare Metal Setup / without Docker (Not recommended)
1. Install PostgreSQL:
    - Install PostgreSQL 13+ on your system
    - Create a database (or use the default postgres database)
    - Note your connection details (username, password, host, port)

2. Clone the repository:
    ```
    git clone https://github.com/yourusername/your-project.git
    cd your-project
    ```

3. Install dependencies:
    ```
    npm install
    ```

4. Set up environment variables:
    ```
    cp .env.example .env
    ```
    >  Set variables as you wish

5. Start the application:
    ```
    npm run dev
    ```
6. Seed the database like the docker installation (above) and call the APIs...

# Notes & Assumptions
I assumed that patient record is the same as a list of patient's appointments; with this, I developed an user's record API that works for both patient and dentist and shows all their appointments (`/api/users/:id/record`).

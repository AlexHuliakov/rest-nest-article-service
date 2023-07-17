## About the project
This is a simple NestJS application that uses the [NestJS](https://nestjs.com/) framework to create a REST API for a simple blog application. The application uses [TypeORM](https://typeorm.io/#/) to connect to a PostgreSQL database.

In the application you can register a user, login, write/update/delete and article, read global feed, (un)favorite any article and then look at favorite feed, leave a comment. Also you can look at other people profiles and follow them, to get them into your feed. The application uses JWT for authentication and authorization.

All routes are made according to [RealWorld API Spec](https://realworld-docs.netlify.app/docs/specs/backend-specs/endpoints) so it can work with any frontend implementation that is made according to this spec.
## Installation

1. Install the dependencies:
    ```bash
    $ npm install
    ```

2. Host the database using Docker
    ```bash
    $ docker-compose up -d
    ```

3. Migrate and the database
    ```bash
    $ npm run db:migrate
    ```

4. (Optional) Seed the database with some data
    ```bash
    $ npm run db:seed
    ```

## Running the app


```bash
# development with watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


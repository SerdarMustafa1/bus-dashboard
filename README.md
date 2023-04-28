# Bus App

SAAS Product for organisations to track their marketing campaigns for advertising installs in public transport

<!-- ![App Preview](assets/preview.gif) -->

## Installation

Clone the repo

```bash
https://github.com/oda-agency/bus-dashboard.git
```

```bash
cd bus-dashboard
```

```bash
npm install
```

## Usage

You'll find a copy of the DB in root to use in your DB GUI. Just create a db locally and restore using the .sql file. (I recommend using mysql workbench or DBeaver, both free).

Use of docker is needed, just go to the docker-compose.yml file in root and compose-up.

Via the use of Concurrently package, just run this from root.

```
npm run dev
```

## Dependencies:

## Contributing

## License

## Appendix:

### Styling

Most of the styling was previoulsly placed in a single behemoth of a standard css file, under: client/src/css. Also a fair bit of inline styling as the UI is built from mainly react-bootstrap components. Good Luck!

### State is managed using local/session storage

## DB

It's mySql via AWS, elastic beanstalk

##
# bus-dashboard
